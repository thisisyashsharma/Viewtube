import { WatchEvent } from "../models/watchEvent.model.js";
import { DailyChannelStats } from "../models/dailyChannelStats.modal.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiResponse } from "../utils/ApiResponse.utils.js";

function normalizeDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// POST /api/v1/analytics/watch
const recordWatchEvent = asyncHandler(async (req, res) => {
  console.log("ANALYTICS HIT", req.user?._id, req.body);
  const userId = req.user._id;
  const { videoId, watchedSeconds, sessionId } = req.body;

  if (!videoId || !watchedSeconds) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Invalid watch payload"));
  }

  const day = normalizeDay();

  await WatchEvent.create({
    user: userId,
    video: videoId,
    watchedSeconds,
    sessionId,
    day,
  });

  const video = await Video.findById(videoId).select("owner");
  if (!video || !video.owner) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "Video owner not found"));
  }
  await DailyChannelStats.findOneAndUpdate(
    { channel: video.owner, day },
    {
      $inc: {
        views: 1,
        watchSeconds: watchedSeconds,
      },
    },
    { upsert: true }
  );

  // OPTIONAL: cache total views (not analytics source)
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, null, "Watch event recorded"));
});

// GET /api/v1/analytics/channel/daily?range=7
const getChannelDailyAnalytics = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;

  const data = await WatchEvent.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    { $unwind: "$video" },
    {
      $match: {
        "video.owner": ownerId,
      },
    },
    {
      $group: {
        _id: "$day",
        totalViews: { $sum: 1 },
        totalWatchSeconds: { $sum: "$watchedSeconds" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json(new ApiResponse(200, data, "Daily analytics"));
});

export { recordWatchEvent, getChannelDailyAnalytics };
