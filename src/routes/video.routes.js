//video.routes.js

import { Router } from "express";
import {
  publishAVideo,
  getAllVideos,
  getAllUserVideos,
  deleteVideoById,
  VideoDataById,
  viewsIncrement,
  streamVideo,
  getMyLikedVideos,
  searchVideos,
  getVideoPlayback,
  updateVideoDetails,
  toggleVideoLike,
  getVideoLikeStatus,
  getSubscribedVideos,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadLimiter } from "../middlewares/rateLimiter.middleware.js";
import { validate, videoPublishValidation } from "../middlewares/validate.middleware.js";

const router = Router();

const videoUpload = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "videoFile", maxCount: 1 },
]);

router.get("/stream/:filename", streamVideo);
router.route("/allVideo").get(getAllVideos);
router.route("/allUserVideo/:owner").get(getAllUserVideos);
router.route("/videoData/:id").get(VideoDataById);

router.use(verifyJWT); // Apply verifyJWT middleware to all routes below this line

router.get("/subscribedFeed", getSubscribedVideos);
router.route("/search").get(searchVideos);

router.route("/publish").post(uploadLimiter, videoUpload, validate(videoPublishValidation), publishAVideo);
router.route("/delete/:id").delete(deleteVideoById);
router.route("/update/:id").put(upload.fields([{ name: "thumbnail", maxCount: 1 }]), updateVideoDetails);
router.route("/incrementView/:id").put(viewsIncrement);

// Like feature
router.put("/:id/like", toggleVideoLike);
router.get("/:id/like/status", getVideoLikeStatus);
router.get("/likes", getMyLikedVideos);
router.get("/:id/playback", getVideoPlayback);

export default router;
