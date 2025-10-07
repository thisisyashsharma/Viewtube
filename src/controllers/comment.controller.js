//EU9u1.p2.a1.193ln - Comment + Username 
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

// POST /api/v1/comments/:videoId
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) throw new ApiError(400, "Content is required");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  return res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});

// GET /api/v1/comments/:videoId?page=1&limit=20
const getCommentsByVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = Math.max(1, parseInt(req.query.page || "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit || "20", 10))
  );

  const [items, total] = await Promise.all([
    Comment.find({ video: videoId })
      .populate("owner", "avatar username")
      .populate("replies.owner", "avatar username")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments({ video: videoId }),
  ]);

  const hasMore = page * limit < total;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { items, page, limit, total, hasMore },
        "Comments fetched"
      )
    );
});

// GET /api/v1/comments/:videoId/count
const getCommentCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const total = await Comment.countDocuments({ video: videoId });
  return res.status(200).json(new ApiResponse(200, { total }, "OK"));
});

// DELETE /api/v1/comments/:id
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (comment.owner.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized");

  await comment.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});

// POST /api/v1/comments/:id/replies
const addReply = asyncHandler(async (req, res) => {
  const { id } = req.params;                 // comment id
  const { content, parentReplyId } = req.body;

  if (!content?.trim()) throw new ApiError(400, "Content is required");

  const c = await Comment.findById(id);
  if (!c) throw new ApiError(404, "Comment not found");

  if (parentReplyId) {
    const parent = c.replies.id(parentReplyId);
    if (!parent) throw new ApiError(404, "Parent reply not found");
    // enforce ONE-LEVEL depth only
    if (parent.parentReply) {
      throw new ApiError(400, "Only one level of reply depth is allowed");
    }
  }

  c.replies.push({
    content,
    owner: req.user._id,
    parentReply: parentReplyId || null,
  });

  await c.save();

  // return the newly added reply (last one)
  const newReply = c.replies[c.replies.length - 1];
  return res.status(201).json(new ApiResponse(201, newReply, "Reply added"));
});









// PATCH /api/v1/comments/:id/like
const toggleLikeComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const uid = req.user._id;

  const c = await Comment.findById(id);
  if (!c) throw new ApiError(404, "Comment not found");

  const i = c.likes.users.findIndex((u) => u.toString() === uid.toString());
  if (i >= 0) {
    c.likes.users.splice(i, 1);
    c.likes.count = Math.max(0, c.likes.count - 1);
  } else {
    c.likes.users.push(uid);
    c.likes.count += 1;
  }
  await c.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { count: c.likes.count }, "OK"));
});

// PATCH /api/v1/comments/:commentId/replies/:replyId/like
const toggleLikeReply = asyncHandler(async (req, res) => {
  const { commentId, replyId } = req.params;
  const uid = req.user._id;

  const c = await Comment.findById(commentId);
  if (!c) throw new ApiError(404, "Comment not found");
  const r = c.replies.id(replyId);
  if (!r) throw new ApiError(404, "Reply not found");

  const i = r.likes.users.findIndex((u) => u.toString() === uid.toString());
  if (i >= 0) {
    r.likes.users.splice(i, 1);
    r.likes.count = Math.max(0, r.likes.count - 1);
  } else {
    r.likes.users.push(uid);
    r.likes.count += 1;
  }
  await c.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { count: r.likes.count }, "OK"));
});

// DELETE /api/v1/comments/:commentId/replies/:replyId
const deleteReply = asyncHandler(async (req, res) => {
  const { commentId, replyId } = req.params;

  const c = await Comment.findById(commentId);
  if (!c) throw new ApiError(404, "Comment not found");

  const r = c.replies.id(replyId);
  if (!r) throw new ApiError(404, "Reply not found");

  if (r.owner.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not authorized");

  r.deleteOne();
  await c.save();

  return res.status(200).json(new ApiResponse(200, {}, "Reply deleted"));
});

export {
  addComment,
  getCommentsByVideo,
  getCommentCount,
  deleteComment,
  addReply,
  toggleLikeComment,
  toggleLikeReply,
  deleteReply,
};
