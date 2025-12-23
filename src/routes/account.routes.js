import { Router } from "express";

//EU6u3.p3.a1.2wd - Subscribe feature - imported toggleSubscribe, getSubscribeStatus
//EU6u4.p2.a1.1wd -  Subscribed Channels: imported subscribed channels page
import {
  deleteAccount,
  registerUser,
  login,
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
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// username availability + update
router.route("/username/availability").get(checkUsernameAvailability);
router.route("/username").put(verifyJWT, updateUsername);

router.route("/signup").post(registerUser);

router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshtoken").post(refreshAccessToken);

router.route("/delete/:id").delete(deleteAccount);
router.route("/update/:id").put(upload.single("avatar"), updateAccount);

router.route("/userData/:id").get(getUserById);
router.route("/history").get(verifyJWT, GetWatchHistory);
router.route("/addToHistory/:id").put(verifyJWT, addToWatchHistory);


//EU10u1.p2.a1.1ln - Email verification level 2 - route
router.route("/validate-email").get(validateEmailRealtime);

//EU10u2.p4.a1.3ln - Email verification level 2 - send, verify, resend routes
router.route("/send-email-otp").post(sendEmailOtp);
router.route("/verify-email-otp").post(verifyEmailOtp);
router.route("/resend-email-otp").post(resendEmailOtp);

//EU6u3.p3.a2.2ln - Subscribe feature - routed both features
router.put("/subscribe/:channelId", verifyJWT, toggleSubscribe);
router.get("/subscribe/status/:channelId", verifyJWT, getSubscribeStatus);

//EU6u4.p2.a2.1ln -  Subscribed Channels - routed for subscribed page
router.get("/subscriptions", verifyJWT, getMySubscriptions);

//EU10u2.p7.a1.2ln - Email verification level 2 - otp send & verify routes
router.post("/pre-otp/send", preOtpSend);
router.post("/pre-otp/verify",preOtpVerify);

router.get("/me", verifyJWT, getMe);

export default router;
