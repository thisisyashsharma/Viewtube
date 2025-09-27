import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Like } from "../models/like.model.js";                                     // EU6u1.p2.a1.1ln - Like feature 

/*
Convert an absolute path like "C:\.../public/temp/FILE.mp4" or "./public/temp/FILE.mp4"
into a public URL like "http://localhost:8000/temp/FILE.mp4"
*/
const localUrlFromAbsPath = (req, absPath) => {                                     // EU4u2.p0.10l- added this function    
  if (!absPath) return null;
  // normalize windows backslashes to forward slashes
  const normalized = absPath.replace(/\\/g, '/');
  // find "/public" segment
  const idx = normalized.indexOf('/public');
  const relative = idx >= 0 ? normalized.slice(idx + '/public'.length) : normalized;
  const path = relative.startsWith('/') ? relative : `/${relative}`;
  return `${req.protocol}://${req.get('host')}${path}`;
};
// --- END HELPER ---

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
    if (!thumbUpload?.url || !videoUpload?.url) {
      throw new ApiError(400, "File upload problem");
    }
    thumbnailUrl = thumbUpload.url;
    videoUrl = videoUpload.url;
  }

  const video = await Video.create({
    title,
    description,
    thumbnail: thumbnailUrl,
    videoFile: videoUrl,
    owner: req.user._id,
    views: 0, // Initialize views to 0
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

// ********------------------all video find-------------------********

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find(); // Fetch all videos from the Video collection

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

  const userVideos = await Video.find({ owner }); // Fetch all videos that match the owner's ID

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

  const video = await Video.findById(id); // Find the video by ID

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
import fs from "fs";
import path from "path";

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
          "Content-Range": `bytes */${fileSize}`
        });
        return res.end();
      }

      const chunkSize = (end - start) + 1;
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
  const { id } = req.params;              // video id
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

export const getVideoLikeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;            // video id
  const userId = req.user._id;
  const existing = await Like.findOne({ video: id, likedBy: userId });
  const count = await Like.countDocuments({ video: id });
  const liked = !!existing;

  return res
    .status(200)
    .json(new ApiResponse(200, { liked, count }, "Like status"));
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
};
