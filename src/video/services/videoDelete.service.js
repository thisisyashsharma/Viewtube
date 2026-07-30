import Video from "../../models/video.model.js";
import { deleteFromGCS } from "../storage/gcs.client.js";
import { decrementUserStorage } from "../quota/quota.service.js";
import { ApiError } from "../../utils/ApiError.utils.js";

export async function deleteVideoFully({ videoId, requester }) {
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const isOwner = video.owner.toString() === requester._id.toString();
  const isAdmin = requester.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Not authorized");
  }

  // 1️⃣ Delete video file
  if (video.videoFile?.startsWith("videos/")) {
    await deleteFromGCS(video.videoFile);
  }

  // 2️⃣ Delete thumbnail file
  if (video.thumbnail?.startsWith("thumbnails/")) {
    await deleteFromGCS(video.thumbnail);
  }

  // 3️⃣ Roll back quota
  await decrementUserStorage(video.owner, video.size || 0);

  // 4️⃣ Delete DB record
  await video.deleteOne();

  return true;
}
