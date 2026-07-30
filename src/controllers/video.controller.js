//video.controller.js

import fs from "fs";
import path from "path";

import { Video } from "../models/video.model.js";
import { newUser } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";

import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js"; // EU6u1.p2.a1.1ln - Like feature
import { runUploadPipeline } from "../video/upload/upload.pipeline.js";

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

//EU12u2.p1  - Thumbnail Fix
const localUrlFromAbsPath = (req, absPath) => {
  if (!absPath) return null;
  const normalized = String(absPath).replace(/\\/g, "/");
  const idx = normalized.lastIndexOf("/public");
  let relative;
  if (idx >= 0) {
    relative = normalized.slice(idx + "/public".length);
  } else {
    const base = path.basename(normalized);
    relative = `/temp/${base}`;
  }
  if (!relative.startsWith("/")) relative = `/${relative}`;
  const proto = req.get("x-forwarded-proto") || req.protocol;
  return `${proto}://${req.get("host")}${relative}`;
};

import { sanitizeText } from "../utils/sanitize.utils.js";

// ********------------------VIDEO UPLOAD-------------------********

const publishAVideo = asyncHandler(async (req, res) => {
  let { title, description } = req.body;
  
  title = sanitizeText(title);
  description = sanitizeText(description);

  let storage = (
    req.body?.storage ||
    process.env.DEFAULT_STORAGE ||
    "local"
  ).toString().toLowerCase().trim();

  if (storage === "true" || storage === "false" || storage === "1" || storage === "0") {
    storage = (process.env.DEFAULT_STORAGE || "local").toString().toLowerCase().trim();
  }

  const thumbnailFile = req.files?.thumbnail?.[0];
  const videoFile = req.files?.videoFile?.[0];

  if (!req.user || !req.user._id) {
    throw new ApiError(401, "User not authenticated");
  }

  if (!title || !description || !thumbnailFile || !videoFile) {
    throw new ApiError(
      400,
      "All fields are required, including thumbnail and video files"
    );
  }

  let thumbnailUrl, videoUrl;

  // ---------------- LOCAL STORAGE (UNCHANGED) ----------------
  if (storage === "local") {
    thumbnailUrl = localUrlFromAbsPath(req, thumbnailFile.path);
    videoUrl = localUrlFromAbsPath(req, videoFile.path);
  }

  // ---------------- GOOGLE CLOUD STORAGE (NEW) ----------------
  else if (storage === "gcs") {
    const ctx = await runUploadPipeline({
      user: req.user,
      title,
      fileSize: videoFile.size,
      mimeType: videoFile.mimetype,
      fileStream: fs.createReadStream(videoFile.path),
      thumbnailFile,
    });

    videoUrl = ctx.gcsVideoPath;
    thumbnailUrl = ctx.gcsThumbnailPath;
  }

  // ---------------- CLOUDINARY (UNCHANGED DEFAULT) ----------------
  else {
    const thumbUpload = await uploadOnCloudinary(thumbnailFile.path);
    const videoUpload = await uploadOnCloudinary(videoFile.path);

    if (
      !thumbUpload?.url ||
      !videoUpload?.url ||
      !(videoUpload?.secure_url || videoUpload?.url)
    ) {
      throw new ApiError(400, "File upload problem");
    }

    thumbnailUrl = thumbUpload.url;
    videoUrl = videoUpload.secure_url || videoUpload.url;
  }

  // ---------------- DURATION (UNCHANGED) ----------------
  let duration = 0;
  try {
    duration = await getVideoDurationSeconds(videoFile.path);
  } catch (e) {
    // duration fallback
  }

  // ---------------- DB SAVE (UNCHANGED) ----------------
  const video = await Video.create({
    title,
    description,
    thumbnail: thumbnailUrl,
    videoFile: videoUrl,
    duration,
    owner: req.user._id,
    views: 0,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

// ********------------------all video find-------------------********

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find()
    .select("title views createdAt thumbnail owner duration")
    .populate("owner", "name avatar username")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// ********------------------all User video find-------------------********

const getAllUserVideos = asyncHandler(async (req, res) => {
  const { owner } = req.params; // Extract the owner ID from the request parameters

  if (!owner) {
    throw new ApiError(400, "Owner ID is required");
  }

  const userVideos = await Video.find({ owner }) // Fetch all videos that match the owner's ID
    .select("title views createdAt thumbnail owner duration")
    .populate("owner", "name avatar username")
    .lean();

  if (!userVideos.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No videos found for this user"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userVideos, "User videos fetched successfully"));
});

// ********------------------delete video by id-------------------********

import { deleteFromGCS } from "../video/storage/gcs.client.js";
import { decrementUserStorage } from "../video/services/quota.service.js";

const deleteVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");

  const isOwner = video.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) throw new ApiError(403, "Not authorized");

  // ---------- NEW PART ----------
  if (video.videoFile?.startsWith("videos/")) {
    await deleteFromGCS(video.videoFile);
  }

  if (video.thumbnail?.startsWith("thumbnails/")) {
    await deleteFromGCS(video.thumbnail);
  }

  if (video.size) {
    await decrementUserStorage(video.owner, video.size);
  }
  // ---------- NEW PART ----------

  await Video.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

// ********------------------video data by id-------------------********

const VideoDataById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id)
    .select("title description views createdAt thumbnail videoFile owner")
    .populate("owner", "name avatar username")
    .lean();

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  //   await video.incrementViews();
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

// In-memory cache for view deduplication (5 minute cooldown per user/IP per video)
const viewDeduplicationCache = new Map();
const VIEW_COOLDOWN_MS = 5 * 60 * 1000;

// Periodic cleanup of stale cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of viewDeduplicationCache.entries()) {
    if (now - timestamp > VIEW_COOLDOWN_MS) {
      viewDeduplicationCache.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

const viewsIncrement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const clientIdentifier = req.user?._id?.toString() || req.ip || "anonymous";
  const cacheKey = `${clientIdentifier}:${id}`;
  const now = Date.now();

  const lastViewTime = viewDeduplicationCache.get(cacheKey);
  if (lastViewTime && now - lastViewTime < VIEW_COOLDOWN_MS) {
    const video = await Video.findById(id).select("views title");
    return res
      .status(200)
      .json(new ApiResponse(200, video, "View cooldown active (deduplicated)"));
  }

  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await video.incrementViews();
  viewDeduplicationCache.set(cacheKey, now);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Views Updated"));
});

//EU5u1.p2.55ln - added streamVideo controller

const streamVideo = async (req, res) => {
  try {
    const { filename } = req.params;
    let filePath = path.join(process.cwd(), "public", "temp", filename);

    if (!fs.existsSync(filePath)) {
      const altPath = path.join(process.cwd(), "src", "public", "temp", filename);
      if (fs.existsSync(altPath)) {
        filePath = altPath;
      } else {
        return res.status(404).send("File not found");
      }
    }


    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.status(416).set({
          "Content-Range": `bytes */${fileSize}`,
        });
        return res.end();
      }

      const chunkSize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    console.error("Stream error:", err);
    res.status(500).send("Server Error");
  }
};

//EU6u2.p2.a2.30ln - Like feature : +2 functions that're toggleVideoLike and getVideoLikeStatus
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { id } = req.params; // video id
  const userId = req.user._id;

  const existing = await Like.findOne({ video: id, likedBy: userId });
  let liked;
  if (existing) {
    await existing.deleteOne();
    liked = false;
  } else {
    await Like.create({ video: id, likedBy: userId });
    liked = true;
  }

  const count = await Like.countDocuments({ video: id });
  return res
    .status(200)
    .json(new ApiResponse(200, { liked, count }, "Like toggled"));
});

const getVideoLikeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params; // video id
  const userId = req.user._id;
  const existing = await Like.findOne({ video: id, likedBy: userId });
  const count = await Like.countDocuments({ video: id });
  const liked = !!existing;

  return res
    .status(200)
    .json(new ApiResponse(200, { liked, count }, "Like status"));
});
//EU12u1.p2 - Liked Page
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
      populate: { path: "owner", select: "name username avatar" },
    })
    .lean();

  const videos = likes.map((l) => l.video).filter(Boolean);

  return res.status(200).json(new ApiResponse(200, videos, "Liked videos"));
});

function getVideoDurationSeconds(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const dur = metadata?.format?.duration;
      resolve(dur ? Math.floor(Number(dur)) : 0);
    });
  });
}

// In searchVideos function, add sorting logic
// In the searchVideos function, update the sorting logic:

const searchVideos = asyncHandler(async (req, res) => {
  const { query, limit = 50, page = 1, sort = "relevance" } = req.query;

  if (!query || query.trim().length < 1) {
    throw new ApiError(400, "Search query is required");
  }

  const searchRegex = new RegExp(query.trim(), "i");
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build base query
  const baseQuery = {
    $or: [
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ],
  };

  // Define sort based on filter
  let sortOption = {};
  switch (sort) {
    case "newest":
      sortOption = { createdAt: -1 };
      break;
    case "most_liked":
      // Sort by likes (you need to implement this)
      sortOption = { views: -1 }; // Temporary - use views until you have likes count
      break;
    case "most_commented":
      // Sort by comments (you need to implement this)
      sortOption = { views: -1 }; // Temporary - use views until you have comments count
      break;
    case "username":
      // For username sorting, we need to populate owner first
      // We'll handle this differently
      sortOption = { "owner.username": 1 };
      break;
    case "relevance":
    default:
      // Relevance: videos with search term in title first, then newest
      sortOption = {
        // Custom logic: title matches first
        // We'll use aggregation for better relevance
      };
  }

  // For username sorting, we need a different approach
  let videos;
  if (sort === "username") {
    // Use aggregation to sort by owner's username
    videos = await Video.aggregate([
      { $match: baseQuery },
      {
        $lookup: {
          from: "newusers",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      { $sort: { "owner.username": 1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $project: {
          title: 1,
          views: 1,
          createdAt: 1,
          thumbnail: 1,
          duration: 1,
          "owner._id": 1,
          "owner.name": 1,
          "owner.avatar": 1,
          "owner.username": 1,
        },
      },
    ]);
  } else {
    // Normal query for other sorts
    videos = await Video.find(baseQuery)
      .select("title views createdAt thumbnail owner duration")
      .populate("owner", "name avatar username")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
  }

  const total = await Video.countDocuments(baseQuery);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      "Search results fetched"
    )
  );
});

import { getVideoPlaybackUrl } from "../video/playback/playback.service.js";

const getVideoPlayback = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const url = await getVideoPlaybackUrl(id);

  return res
    .status(200)
    .json(new ApiResponse(200, { url }, "Playback URL generated"));
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const userId = req.user._id;

  const video = await Video.findById(id);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== userId.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "You do not have permission to edit this video");
  }

  const updateFields = {};
  if (title && title.trim()) updateFields.title = title.trim();
  if (description !== undefined) updateFields.description = description.trim();

  let thumbnailPath = "";
  if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
    thumbnailPath = req.files.thumbnail[0].path;
  } else if (req.file) {
    thumbnailPath = req.file.path;
  }

  if (thumbnailPath) {
    const thumbnailUrl = localUrlFromAbsPath(req, thumbnailPath);
    if (thumbnailUrl) {
      updateFields.thumbnail = thumbnailUrl;
    }
  }


  const updatedVideo = await Video.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  ).populate("owner", "name avatar email username");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));

});

const getSubscribedVideos = asyncHandler(async (req, res) => {
  let me = null;
  if (req.user?._id) {
    me = await newUser.findById(req.user._id).select("subscribedTo").lean();
  }
  const subscribedIds = me?.subscribedTo || [];

  let query = {};
  if (subscribedIds.length > 0) {
    query = { owner: { $in: subscribedIds } };
  }

  const videos = await Video.find(query)
    .select("title views createdAt thumbnail owner duration likesCount likes")
    .populate("owner", "name avatar username")
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Subscribed feed fetched successfully"));
});

export {
  publishAVideo,
  getAllVideos,
  getAllUserVideos,
  deleteVideoById,
  VideoDataById,
  viewsIncrement,
  streamVideo,
  toggleVideoLike,
  getVideoLikeStatus,
  getMyLikedVideos,
  getVideoDurationSeconds,
  searchVideos,
  getVideoPlayback,
  updateVideoDetails,
  getSubscribedVideos,
};


