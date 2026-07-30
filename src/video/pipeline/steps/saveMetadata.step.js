 
import { Video } from "../../../models/video.model.js";
import { incrementUserStorage } from "../../services/quota.service.js";

export async function saveMetadataStep(ctx) {
  const { userId, gcsPath, fileSize } = ctx;

  const video = await Video.create({
    owner: userId,
    gcsPath,
    size: fileSize,
  });

  await incrementUserStorage(userId, fileSize);

  ctx.video = video;
  return ctx;
}
