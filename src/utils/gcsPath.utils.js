import { randomUUID } from "crypto";

export function sanitize(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function buildVideoPath({ username, title }) {
  const safeTitle = sanitize(title);
  return `videos/${username}/${safeTitle}-${randomUUID()}.mp4`;
}

export function buildThumbnailPath({ username, title, ext }) {
  const safeTitle = sanitize(title);
  return `thumbnails/${username}/${safeTitle}-${randomUUID()}.${ext}`;
}
