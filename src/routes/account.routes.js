import { Router } from "express";

//EU6u3.p3.a1.2wd - Subscribe feature - imported toggleSubscribe, getSubscribeStatus
//EU6u4.p2.a1.1wd -  Subscribed Channels: imported subscribed channels page
import {
  deleteAccount,
  registerUser,
  login,
  googleAuth,
  updateAccount,
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
} from "../controllers/account.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyOwnerOrAdmin } from "../middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter.middleware.js";
import {
  validate,
  signupValidation,
  loginValidation,
  mongoIdValidation,
} from "../middlewares/validate.middleware.js";
import { moderateContent } from "../middlewares/contentModerator.middleware.js";

const router = Router();

// username availability + update
router.route("/username/availability").get(checkUsernameAvailability);
router.route("/username").put(verifyJWT, updateUsername);

router.route("/signup").post(authLimiter, validate(signupValidation), registerUser);

router.route("/login").post(authLimiter, validate(loginValidation), login);
router.route("/google-auth").post(authLimiter, googleAuth);
router.route("/logout").post(authLimiter, verifyJWT, logoutUser);
router.route("/refreshtoken").post(authLimiter, refreshAccessToken);

router
  .route("/delete/:id")
  .delete(authLimiter, verifyJWT, validate(mongoIdValidation("id")), verifyOwnerOrAdmin("id"), deleteAccount);
router
  .route("/update/:id")
  .put(verifyJWT, validate(mongoIdValidation("id")), verifyOwnerOrAdmin("id"), upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), moderateContent, updateAccount);

router.route("/userData/:id").get(validate(mongoIdValidation("id")), getUserById);
router.route("/history").get(verifyJWT, GetWatchHistory);
router.route("/addToHistory/:id").put(verifyJWT, validate(mongoIdValidation("id")), addToWatchHistory);

// Email verification routes
router.route("/validate-email").get(validateEmailRealtime);
router.route("/send-email-otp").post(otpLimiter, sendEmailOtp);
router.route("/verify-email-otp").post(verifyEmailOtp);
router.route("/resend-email-otp").post(otpLimiter, resendEmailOtp);

// Subscribe feature
router.put("/subscribe/:channelId", verifyJWT, validate(mongoIdValidation("channelId")), toggleSubscribe);
router.get("/subscribe/status/:channelId", verifyJWT, validate(mongoIdValidation("channelId")), getSubscribeStatus);

// Subscribed Channels
router.get("/subscriptions", verifyJWT, getMySubscriptions);

// Pre-OTP send & verify routes
router.post("/pre-otp/send", otpLimiter, preOtpSend);
router.post("/pre-otp/verify", preOtpVerify);

router.get("/me", verifyJWT, getMe);

export default router;
