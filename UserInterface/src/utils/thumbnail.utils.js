// src/utils/thumbnail.utils.js
// Normalize thumbnail values into a usable URL and provide a fallback.
function formatDuration(seconds) {
  const s = Number(seconds) || 0;
  if (s <= 0) return "0:00";
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function getPosterFromVideo(video) {
  return `${BASE_URL}/placeholders/no-thumbnail.png`;
}

function getThumbnailUrl(video) {
  try {
    let t = video?.thumbnail ?? "";
    if (typeof t === "object") t = t.url || t.path || t.filename || "";

    t = String(t).trim();
    
    // Strip old hardcoded localhost URLs from old database entries
    t = t.replace(/^https?:\/\/localhost:\d+/i, "");

    if (!t) {
      return getPosterFromVideo(video);
    }

    // Remove leading /public or public
    t = t.replace(/^\/?public/, "");

    // Absolute URL (e.g. Cloudinary, S3, external host) -> use directly
    if (/^https?:\/\//i.test(t)) return t;

    // Ensure single leading slash
    if (!t.startsWith("/")) {
      t = "/" + t;
    }

    // Bare filename starting with /thumbnail- -> prefix /temp
    if (t.startsWith("/thumbnail-")) {
      t = "/temp" + t;
    }

    return `${BASE_URL}${t}`;
  } catch (err) {
    return `${BASE_URL}/placeholders/no-thumbnail.png`;
  }
}

export {
  getPosterFromVideo,
  getThumbnailUrl,
  formatDuration,
};