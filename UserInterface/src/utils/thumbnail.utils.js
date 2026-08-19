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

const FALLBACK_THUMBNAIL = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='100%25' height='100%25' fill='%231f2937'/%3E%3Cpath d='M280 140l100 40-100 40z' fill='%239ca3af'/%3E%3C/svg%3E";

function getPosterFromVideo(video) {
  return FALLBACK_THUMBNAIL;
}

function getThumbnailUrl(videoOrUrl) {
  try {
    if (!videoOrUrl) return FALLBACK_THUMBNAIL;

    let t = "";
    if (typeof videoOrUrl === "string") {
      t = videoOrUrl;
    } else if (typeof videoOrUrl === "object") {
      t =
        videoOrUrl.thumbnailUrl ||
        videoOrUrl.thumbnail ||
        videoOrUrl.avatar ||
        videoOrUrl.coverImage ||
        videoOrUrl.url ||
        videoOrUrl.path ||
        "";
      if (typeof t === "object" && t !== null) {
        t = t.url || t.path || t.filename || "";
      }
    }

    t = String(t).trim();
    
    // Strip old hardcoded localhost URLs from old database entries
    t = t.replace(/^https?:\/\/localhost:\d+/i, "");

    if (!t || t === "undefined" || t === "null") {
      return FALLBACK_THUMBNAIL;
    }

    // Remove leading /public or public
    t = t.replace(/^\/?public/, "");

    // Absolute URL (e.g. Cloudinary, S3, external host, blob/data) -> use directly
    if (/^(https?:\/\/|blob:|data:)/i.test(t)) return t;

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