import { uploadToGCS } from "../../storage/gcs.client.js";
import { sanitize } from "../../../utils/gcsPath.utils.js";
import { randomUUID } from "crypto";
import fs from "fs";

export async function uploadThumbnailToGCSStep(ctx) {
  const { thumbnailFile, user, title } = ctx;

  const username = sanitize(user.username);
  const safeTitle = sanitize(title);
  const uid = randomUUID().slice(0, 8);

  const gcsPath = `users/${username}/thumbnails/${safeTitle}_${uid}.jpg`;

  const stream = fs.createReadStream(thumbnailFile.path);

  const { gcsPath: uploadedPath } = await uploadToGCS({
    fileStream: stream,
    destination: gcsPath,
    contentType: thumbnailFile.mimetype || "image/jpeg",
  });

  ctx.gcsThumbnailPath = uploadedPath;
  return ctx;
}
