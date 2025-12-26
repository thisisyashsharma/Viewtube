import { newUser } from "../models/account.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dns from "dns/promises";
import crypto from "crypto";
import { sendMail } from "../utils/mailer.utils.js";

import { Preverify } from "../models/preverify.model.js";
import { SubscriptionEvent } from "../models/subscriptionEvent.model.js";
import { DailyChannelStats } from "../models/dailyChannelStats.modal.js";

const normalizeDay = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await newUser.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};

// {******------------------------ register user---------------------------******}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, about, preVerifiedToken } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const checkUser = await newUser.findOne({
    $or: [{ name }, { email }],
  });

  if (checkUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //EU10u2.p8.a1.6ln - Email verification level 2 - accepts otp token and mark accept
  let isVerified = false;
  if (preVerifiedToken) {
    try {
      const secret =
        process.env.EMAIL_PREVERIFY_SECRET || process.env.ACCESS_TOKEN_SECRET;
      const payload = jwt.verify(preVerifiedToken, secret);
      if (
        payload?.pre_verified &&
        payload?.email?.toLowerCase() === email.toLowerCase()
      ) {
        isVerified = true;
      }
    } catch {}
  }

  const avatar =
    "https://res.cloudinary.com/drr9bsrar/image/upload/v1716498256/egt2sufg3qzyn1ofws9t.jpg";

  // inside registerUser, after validation and before create:
  const base = (name || email.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  let candidate = base || "user";
  let suffix = 0;
  while (await newUser.findOne({ username: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  const isAdminEmail =
  process.env.ADMIN_EMAIL &&
  email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();




  const user = await newUser.create({
    name,
    email,
    password,
    avatar,
    username: candidate,
    isVerified,
    role: isAdminEmail ? "admin" : "user",

  });

  return res
    .status(201)
    .json(new ApiResponse(200, user, "User created successfully"));
});

// GET /api/v1/account/username/availability?username=foo
const checkUsernameAvailability = asyncHandler(async (req, res) => {
  const q = String(req.query.username || "")
    .toLowerCase()
    .trim();
  if (!q || !/^[a-z0-9_]{3,20}$/.test(q)) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, { available: false }, "Invalid username format")
      );
  }
  const exists = await newUser.findOne({ username: q });
  return res
    .status(200)
    .json(new ApiResponse(200, { available: !exists }, "OK"));
});

// PUT /api/v1/account/username
const updateUsername = asyncHandler(async (req, res) => {
  const uid = req.user._id; // needs verifyJWT
  const { username } = req.body;
  const desired = String(username || "")
    .toLowerCase()
    .trim();

  if (!/^[a-z0-9_]{3,20}$/.test(desired)) {
    throw new ApiError(400, "Invalid username format");
  }
  const taken = await newUser.findOne({ username: desired, _id: { $ne: uid } });
  if (taken) throw new ApiError(409, "Username already taken");

  const user = await newUser
    .findByIdAndUpdate(uid, { $set: { username: desired } }, { new: true })
    .select("name email avatar username");

  return res.status(200).json(new ApiResponse(200, user, "Username updated"));
});

// {------------------------ register user---------------------------}

// {*****------------------------ login user---------------------------******}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const userfind = await newUser.findOne({ email });

  if (!userfind) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await userfind.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userfind._id
  );

  const loggedInUser = await newUser
    .findById(userfind._id)
    .select("-refreshToken");

  const options = {
    httpOnly: true,
    secure: false, // <— false for http://localhost in dev      //3.ERROR - Token Error - step3
    sameSite: "lax", // <- added this line                        //3.Error - Token Error - step4
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});
// {------------------------ login user---------------------------}

// {**********-------------------logout user-------------------**********}

const logoutUser = asyncHandler(async (req, res) => {
  await newUser.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});
// {**********-------------------logout user-------------------**********}

// {**********-------------------refrese  token-------------------**********}

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      Refreq.cookies.refreshToken || req.body.refreshToken;

    if (incomingRefreshToken) {
      throw new ApiError(401, "unauthorized requrest");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET
    );

    const user = await newUser.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token (user not found)");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used or rotated");
    }

    const options = {
      httpOnly: true,
      secure: false, // <— false for http://localhost in dev      //3.ERROR - Token Error - step5
      sameSite: "lax", // <- added this line                        //3.ERROR - Token Error - step6
    };

    const {
      accessToken,
      refreshToken,
    } = //3.ERROR - Token Error = step7 - "rewrefreshToken" to "refreshToken"
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refresh: newrefreshToken },
          "Refresh token generated"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// {**********-------------------refrese  token-------------------**********}

// {**********-------------------Update user-------------------**********}

const updateAccount = asyncHandler(async (req, res) => {
  const { name, email, password, about } = req.body;

  // allow partial updates; only error if literally nothing was sent
  if (
    !req.file &&
    name === undefined &&
    email === undefined &&
    password === undefined &&
    about === undefined
  ) {
    throw new ApiError(400, "No fields to update");
  }

  let avatarName;
  if (req.file) {
    const avatarLocalPath = req.file.path;
    avatarName = await uploadOnCloudinary(avatarLocalPath);
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (about !== undefined) updateData.about = about;
  if (password !== undefined && password !== "") {
    updateData.password = await bcrypt.hash(password, 10);
  }
  if (avatarName) {
    updateData.avatar = avatarName.url;
  }

  const user = await newUser.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});
// {-----------------------------Update user-----------------------------}

// {----------------------------Delete user-------------------------------}

const deleteAccount = asyncHandler(async (req, res) => {
  const user = await newUser.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    message: "Account deleted successfully",
  });
});
// {----------------------------Delete user-------------------------------}
// {----------------------------User Data By Id-------------------------------}

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  // console.log(userId);

  const user = await newUser.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User data retrieved successfully"));
});

// {----------------------------User Data By Id-------------------------------}

// {----------------------------Watch History---------------------------------}
const GetWatchHistory = asyncHandler(async (req, res) => {
  const user = await newUser.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "newusers",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    name: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

// {----------------------------Add Watch History---------------------------------}

const addToWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(id);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const user = await newUser.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Add the video to the watch history
  if (!user.watchHistory.includes(id)) {
    user.watchHistory.push(id);
    await user.save();
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.watchHistory,
        "Video added to watch history successfully"
      )
    );
});

//EU6u3.p2.a1.42ln - Subscribe feature: +2 function toggleSubscribe & getSubscribeStatus

const toggleSubscribe = asyncHandler(async (req, res) => {
  const viewerId = req.user._id;
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (viewerId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channel = await newUser.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");

  // ✅ DEFINE FIRST
  const already = await newUser.exists({
    _id: channelId,
    subscribers: viewerId,
  });

  // ✅ TOGGLE SUBSCRIPTION
  if (already) {
    await newUser.findByIdAndUpdate(channelId, {
      $pull: { subscribers: viewerId },
    });
    await newUser.findByIdAndUpdate(viewerId, {
      $pull: { subscribedTo: channelId },
    });
  } else {
    await newUser.findByIdAndUpdate(channelId, {
      $addToSet: { subscribers: viewerId },
    });
    await newUser.findByIdAndUpdate(viewerId, {
      $addToSet: { subscribedTo: channelId },
    });
  }

  // ✅ ANALYTICS (NON-BLOCKING)
  try {
    const day = normalizeDay();

    await SubscriptionEvent.create({
      channel: channelId,
      user: viewerId,
      action: already ? "unsubscribe" : "subscribe",
      day,
    });

    await DailyChannelStats.findOneAndUpdate(
      { channel: channelId, day },
      { $inc: { subscriberDelta: already ? -1 : 1 } },
      { upsert: true }
    );
  } catch (err) {
    console.error("Subscription analytics failed:", err.message);
  }

  const updated = await newUser.findById(channelId).select("subscribers");
  const count = updated?.subscribers?.length || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      { subscribed: !already, count },
      "Subscription toggled"
    )
  );
});

const getSubscribeStatus = asyncHandler(async (req, res) => {
  const viewerId = req.user._id;
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await newUser.findById(channelId).select("subscribers");
  if (!channel) throw new ApiError(404, "Channel not found");

  const subscribed =
    channel.subscribers?.some((id) => id.toString() === viewerId.toString()) ||
    false;
  const count = channel.subscribers?.length || 0;

  return res
    .status(200)
    .json(new ApiResponse(200, { subscribed, count }, "Subscription status"));
});

//EU6u4.p1.a1.17ln - Subscribed Channels : +function getMySubscriptions
const getMySubscriptions = asyncHandler(async (req, res) => {
  const me = await newUser
    .findById(req.user._id)
    .select("subscribedTo")
    .populate({
      path: "subscribedTo",
      select: "name avatar subscribers username about ",
    });

  const channels = (me?.subscribedTo || []).map((ch) => ({
    _id: ch._id,
    name: ch.name,
    avatar: ch.avatar,
    username: ch.username ?? null,
    about: ch.about ?? "",
    subscribersCount: Array.isArray(ch.subscribers) ? ch.subscribers.length : 0,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, { channels }, "My subscriptions"));
});
// GET /api/v1/account/me
//EU9u1.p4.a1.6ln - Comment + Username
const getMe = asyncHandler(async (req, res) => {
  const me = await newUser.findById(req.user._id).select("_id username avatar role");
  return res.status(200).json(new ApiResponse(200, me, "OK"));
});

//EU10u1.p1.a1.73ln - Email verification level 2 - Real-time email validation

// GET /api/v1/account/validate-email?email=foo@bar.com
const validateEmailRealtime = asyncHandler(async (req, res) => {
  const emailRaw = String(req.query.email || "").trim();

  // 1) Syntax check (frontend also does this, but we re-check on server)
  const syntaxRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const syntaxValid = syntaxRegex.test(emailRaw);

  const result = {
    email: emailRaw,
    syntaxValid,
    domainHasMX: false,
    isDisposable: false,
    deliverability: "unknown", // "deliverable" | "undeliverable" | "risky" | "unknown"
    notes: [],
  };

  if (!syntaxValid) {
    return res.status(200).json(new ApiResponse(200, result, "Syntax invalid"));
  }

  const [, domain] = emailRaw.split("@");

  // 2) Domain MX lookup
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (Array.isArray(mxRecords) && mxRecords.length > 0) {
      result.domainHasMX = true;
    } else {
      result.notes.push("No MX records found.");
    }
  } catch {
    result.notes.push("MX lookup failed or domain not found.");
  }

  // 3) Disposable domain check (minimal in-file list; you can swap for a lib. )
  const disposableList = new Set([
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
  ]);
  if (disposableList.has(domain)) {
    result.isDisposable = true;
    result.notes.push("Disposable/temporary email domain.");
  }

  // 4) Deliverability via 3rd party service (optional but best for acc)
  // 5) Configure one provider using env var (DON'T expose on frontend)- eg.Kickbox
  if (process.env.KICKBOX_API_KEY) {
    try {
      const kb = await axios.get("https://api.kickbox.com/v2/verify", {
        params: {
          email: emailRaw,
          apikey: process.env.KICKBOX_API_KEY,
        },
        timeout: 6000,
      });
      // kb.data.result → "deliverable" | "undeliverable" | "risky" | "unknown"
      if (kb?.data?.result) result.deliverability = kb.data.result;
      if (kb?.data?.reason) result.notes.push(`Reason: ${kb.data.reason}`);
    } catch (e) {
      result.notes.push(
        "3rd-party deliverability check failed (timeout/blocked)."
      );
    }
  } else {
    result.notes.push("No 3rd-party validator configured.");
  }

  return res.status(200).json(new ApiResponse(200, result, "OK"));
});

//EU10u2.p3.a1.135ln - Email verification level 2 - func logic- makeAlphaNumOTP, otpEmailTemplate, sendEmailOtp, verifyEmailOtp, resendEmailOtp

// Alphanumeric OTP (A–Z, 0–9), uppercase, length from env or default 8
function makeAlphaNumOTP(length = 6) {
  const L = Math.max(4, Math.min(32, Number(process.env.OTP_LENGTH) || length));
  const bytes = crypto.randomBytes(L);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < L; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function sha256(s) {
  return crypto.createHash("sha256").update(String(s)).digest("hex");
}

function minutesFromNow(mins) {
  const m = Number(process.env.OTP_VALID_MINUTES) || mins || 5;
  return new Date(Date.now() + m * 60 * 1000);
}

function otpEmailTemplate({ code, validMinutes }) {
  const v = validMinutes ?? (Number(process.env.OTP_VALID_MINUTES) || 5);
  return {
    subject: "Your One-Time Verification Code",
    text: `Your verification code is: ${code}

Please use this code to verify your email address.
This code will remain valid for ${v} minutes.

If you did not make this request, you can safely ignore this email.`,
    html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;line-height:1.6">
  <p>Hello,</p>
  <p>Your verification code is:</p>
  <div style="font-size:22px;font-weight:700;letter-spacing:2px;background:#f6f6f6;border:1px solid #eaeaea;padding:12px 16px;display:inline-block;border-radius:8px">
    ${code}
  </div>
  <p style="margin-top:12px">Please use this code to verify your email address.</p>
  <p style="color:#555">This code will remain valid for <strong>${v} minutes</strong>.</p>
  <p style="color:#777;font-size:12px">If you did not make this request, you can safely ignore this email.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:16px 0" />
  <p style="color:#999;font-size:12px">Sent from an automated address. Replies are not monitored.</p>
</div>`,
  };
}

const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await newUser.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // Optional: if already verified, short-circuit
  if (user.isVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { alreadyVerified: true },
          "Email already verified"
        )
      );
  }

  const otp = makeAlphaNumOTP();
  user.emailOtpHash = sha256(otp);
  user.emailOtpExpires = minutesFromNow(15);
  user.emailOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const tpl = otpEmailTemplate({
    code: otp,
    validMinutes: Number(process.env.OTP_VALID_MINUTES) || 5,
  });
  await sendMail({
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  return res.status(200).json(new ApiResponse(200, { sent: true }, "OTP sent"));
});

const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const user = await newUser.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  if (user.isVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, { ok: true }, "Already verified"));
  }

  if (
    !user.emailOtpHash ||
    !user.emailOtpExpires ||
    new Date() > user.emailOtpExpires
  ) {
    throw new ApiError(400, "OTP expired, please request a new one");
  }

  if ((user.emailOtpAttempts || 0) >= 5) {
    throw new ApiError(429, "Too many attempts, please request a new OTP");
  }

  user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;

  const ok = sha256(String(otp)) === user.emailOtpHash;
  if (!ok) {
    await user.save({ validateBeforeSave: false });
    throw new ApiError(400, "Incorrect OTP");
  }

  user.isVerified = true;
  user.emailOtpHash = undefined;
  user.emailOtpExpires = undefined;
  user.emailOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, { ok: true }, "Email verified"));
});

const resendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await newUser.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { alreadyVerified: true },
          "Email already verified"
        )
      );
  }

  // Optional: simple cooldown — do not resend if current OTP is still valid for > 2 min
  if (
    user.emailOtpExpires &&
    user.emailOtpExpires > new Date(Date.now() + 1 * 60 * 1000)
  ) {
    return res
      .status(429)
      .json(
        new ApiResponse(429, { retryAfter: 60 }, "Please wait 1 min resending")
      );
  }

  const otp = makeAlphaNumOTP();
  user.emailOtpHash = sha256(otp);
  user.emailOtpExpires = minutesFromNow(5);
  user.emailOtpAttempts = 0;
  await user.save({ validateBeforeSave: false });

  const tpl = otpEmailTemplate({
    code: otp,
    validMinutes: Number(process.env.OTP_VALID_MINUTES) || 5,
  });
  await sendMail({
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { sent: true }, "OTP resent"));
});

//EU10u2.p6.a1.50ln  - Email verification level 2 - presignup send + verify

// issue short-lived proof JWT after OTP verify (stateless proof)
function issuePreverifiedJWT(email) {
  const secret =
    process.env.EMAIL_PREVERIFY_SECRET || process.env.ACCESS_TOKEN_SECRET;
  // short life: 15 min
  return jwt.sign({ email, pre_verified: true }, secret, { expiresIn: "15m" });
}

// POST /api/v1/account/pre-otp/send { email }
const preOtpSend = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const otp = makeAlphaNumOTP(Number(process.env.OTP_LENGTH) || 6);
  const doc = {
    email: email.toLowerCase().trim(),
    otpHash: sha256(otp),
    expiresAt: minutesFromNow(Number(process.env.OTP_VALID_MINUTES) || 5),
    attempts: 0,
  };
  await Preverify.findOneAndUpdate({ email: doc.email }, doc, { upsert: true });

  const tpl = otpEmailTemplate({
    code: otp,
    validMinutes: Number(process.env.OTP_VALID_MINUTES) || 5,
  });
  await sendMail({
    to: email,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });

  return res.json(new ApiResponse(200, { sent: true }, "OTP sent"));
});

// POST /api/v1/account/pre-otp/verify { email, otp }
const preOtpVerify = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

  const rec = await Preverify.findOne({ email: email.toLowerCase().trim() });
  if (!rec || new Date() > rec.expiresAt)
    throw new ApiError(400, "OTP expired, please send again");
  if ((rec.attempts || 0) >= 5)
    throw new ApiError(429, "Too many attempts, resend OTP");

  rec.attempts = (rec.attempts || 0) + 1;
  const ok = sha256(String(otp)) === rec.otpHash;
  await rec.save();

  if (!ok) throw new ApiError(400, "Incorrect OTP");

  // success → issue short-lived proof token, and delete record (optional)
  const token = issuePreverifiedJWT(rec.email);
  await Preverify.deleteOne({ _id: rec._id });

  return res.json(
    new ApiResponse(200, { preVerifiedToken: token }, "Email pre-verified")
  );
});

export {
  registerUser,
  updateAccount,
  deleteAccount,
  login,
  logoutUser,
  refreshAccessToken,
  getUserById,
  GetWatchHistory,
  addToWatchHistory,
  toggleSubscribe,
  getSubscribeStatus,
  getMySubscriptions,
  checkUsernameAvailability,
  updateUsername,
  getMe,
  validateEmailRealtime,
  sendEmailOtp,
  verifyEmailOtp,
  resendEmailOtp,
  preOtpSend,
  preOtpVerify,
};
