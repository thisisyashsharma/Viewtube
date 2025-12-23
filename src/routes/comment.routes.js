//EU9u1.p3.a1.34ln - Comment + Username 
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  getCommentsByVideo,
  getCommentCount,
  deleteComment,
  addReply,
  toggleLikeComment,
  toggleLikeReply,
  deleteReply,
} from "../controllers/comment.controller.js";

const router = Router();

// READ routes can be public if you want; for now we keep all behind auth (like your /watch page).
router.use(verifyJWT);

// comments on a video
router.route("/:videoId")
  .post(addComment)
  .get(getCommentsByVideo);

router.get("/:videoId/count", getCommentCount);
router.delete("/:id", deleteComment);


router.post("/:id/replies", addReply);
router.patch("/:commentId/replies/:replyId/like", toggleLikeReply);
router.delete("/:commentId/replies/:replyId", deleteReply);

router.patch("/:id/like", toggleLikeComment);

export default router;
