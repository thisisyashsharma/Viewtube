import { newUser } from "../models/account.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dns from "dns/promises";

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
  const { name, email, password, about } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const checkUser = await newUser.findOne({
    $or: [{ name }, { email }],
  });

  if (checkUser) {
    throw new ApiError(409, "User with email or username already exists");
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

  const user = await newUser.create({
    name,
    email,
    password,
    avatar,
    username: candidate,
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
  const viewerId = req.user._id; // signed-in user
  const { channelId } = req.params; // channel owner userId

  if (viewerId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const channel = await newUser.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");

  const already = await newUser.exists({
    _id: channelId,
    subscribers: viewerId,
  });

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

  const updated = await newUser.findById(channelId).select("subscribers");
  const count = updated?.subscribers?.length || 0;

  return res
    .status(200)
    .json(
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
      select: "name avatar subscribers username about", // we’ll derive count from array length
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
  const me = await newUser.findById(req.user._id).select("_id username avatar");
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

export {
  registerUser,
  login,
  updateAccount,
  deleteAccount,
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
};
