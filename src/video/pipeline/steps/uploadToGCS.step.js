import fs from "fs";
import path from "path";
import { uploadToGCS } from "../../storage/gcs.client.js";
import { buildThumbnailPath, buildVideoPath } from "../../../utils/gcsPath.utils.js";
 
export async function uploadToGCSStep(ctx) {
  const { user, title, fileStream, mimeType, thumbnailFile } = ctx;

  // ---- VIDEO PATH ----
  const videoPath = buildVideoPath({
    username: user.username,
    title,
  });

  await uploadToGCS({
    fileStream,
    destination: videoPath,
    contentType: mimeType,
  });

  // ---- THUMBNAIL PATH ----
  const ext = path.extname(thumbnailFile.originalname).slice(1);
  const thumbPath = buildThumbnailPath({
    username: user.username,
    title,
    ext,
  });

  await uploadToGCS({
    fileStream: fs.createReadStream(thumbnailFile.path),
    destination: thumbPath,
    contentType: thumbnailFile.mimetype,
  });

  ctx.gcsVideoPath = videoPath;
  ctx.gcsThumbnailPath = thumbPath;

  return ctx;
}
