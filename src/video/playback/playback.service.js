import {Video} from "../../models/video.model.js";
import { getSignedReadUrl } from "../storage/gcs.client.js";
import { ApiError } from "../../utils/ApiError.utils.js";

export async function getVideoPlaybackUrl(videoId) {
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (!video.videoFile?.startsWith("videos/")) {
    throw new ApiError(400, "Video not stored on GCS");
  }

  const signedUrl = await getSignedReadUrl(video.videoFile, 10);
  return signedUrl;
}
