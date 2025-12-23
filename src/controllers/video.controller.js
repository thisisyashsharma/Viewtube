import fs from "fs";
import path from "path";

import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js"; // EU6u1.p2.a1.1ln - Like feature

import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

 
 

// const localUrlFromAbsPath = (req, absPath) => {
//   // EU4u2.p0.10l- added this function
//   if (!absPath) return null;
//   const normalized = absPath.replace(/\\/g, "/");
//   const idx = normalized.lastIndexOf("/public"); // EU8u1.p3.a1.1wd - Thumbnail fixing : indexOf -> lastIndexOf
//   const relative =
//     idx >= 0 ? normalized.slice(idx + "/public".length) : normalized;
//   const path = relative.startsWith("/") ? relative : `/${relative}`;
//   const proto = req.get("x-forwarded-proto") || req.protocol;
//   return `${proto}://${req.get("host")}${path}`;
// };
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

// ********------------------video upload-------------------********

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const storage = (
    req.body?.storage ||
    process.env.DEFAULT_STORAGE ||
    "cloud"
  ).toLowerCase();

  const thumbnailFile = req.files?.thumbnail?.[0];
  const videoFile = req.files?.videoFile?.[0];

  if (!title || !description || !thumbnailFile || !videoFile) {
    throw new ApiError(
      400,
      "All fields are required, including thumbnail and video files"
    );
  }

  let thumbnailUrl, videoUrl;
  if (storage === "local") {
    // Use local files as-is (Multer already wrote to public/temp)
    thumbnailUrl = localUrlFromAbsPath(req, thumbnailFile.path);
    videoUrl = localUrlFromAbsPath(req, videoFile.path);
  } else {
    // Default: Cloudinary
    const thumbUpload = await uploadOnCloudinary(thumbnailFile.path);
    const videoUpload = await uploadOnCloudinary(videoFile.path);
    if (
      !thumbUpload?.url ||
      !videoUpload?.url ||
      !(videoUpload?.secure_url || videoUpload?.url)
    ) {
      throw new ApiError(400, "File upload problem");
    }
    thumbnailUrl = thumbUpload.url || thumbUpload.url;
    videoUrl = videoUpload.url || videoUpload.url;
  }

  // ⬇️ ADD THIS
  let duration = 0;
  try {
    duration = await getVideoDurationSeconds(videoFile.path);
  } catch (e) {
    console.error("Failed to read video duration", e);
  }

  const video = await Video.create({
    title,
    description,
    thumbnail: thumbnailUrl,
    videoFile: videoUrl,
    duration,
    owner: req.user._id,
    views: 0, // Initialize views to 0
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

const deleteVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the video ID from the request parameters
  const userId = req.user._id; // Get the ID of the logged-in user

  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the logged-in user is the owner of the video
  if (video.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await Video.findByIdAndDelete(id); // Delete the video from the database

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

// ********------------------video data by id-------------------********

const VideoDataById = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the video ID from the request parameters
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

// -------------------------views increment---------------------------

const viewsIncrement = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the video ID from the request parameters

  const video = await Video.findById(id); // Find the video by ID

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await video.incrementViews();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Views Updated"));
});

//EU5u1.p2.55ln - added streamVideo controller

const streamVideo = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), "public", "temp", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
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
};
