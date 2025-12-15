// /mnt/data/like.controller.js
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";


// GET /api/v1/likes  -> returns array of liked videos for the authenticated user
const getMyLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user && req.user._id;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
  }

  // Find all likes by this user and populate the video and its owner (if video still exists)
  const likes = await Like.find({ likedBy: userId })
    .populate({
      path: "video",
      select: "title thumbnail views owner createdAt",
      populate: { path: "owner", select: "name username avatar" }
    })
    .lean();

  const videos = likes.map((l) => l.video).filter(Boolean);

  return res.status(200).json(new ApiResponse(200, videos, "Liked videos"));
});

export { getMyLikedVideos };
