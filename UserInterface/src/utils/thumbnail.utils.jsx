// src/utils/thumbnail.utils.js
// Normalize thumbnail values into a usable URL and provide a small poster fallback.
function formatDuration(seconds) {
  // seconds: numeric duration in seconds (DB stores seconds)
  const s = Number(seconds) || 0;
  if (s <= 0) return "0:00";
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}


const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getPosterFromVideo(video) {
  return `${BASE_URL}/placeholders/no-thumbnail.png`;
}

function getThumbnailUrl(video) {
  try {
    let t = video?.thumbnail ?? "";
    if (typeof t === "object") t = t.url || t.path || t.filename || "";

    t = String(t).trim();

    if (!t) {
      const poster = getPosterFromVideo(video);
      return poster || `${BASE_URL}/placeholders/loading1.gif`;
    }

    // remove stray '/public' if present
    t = t.replace("/public", "");

    // absolute url -> use as-is
    if (/^https?:\/\//i.test(t)) return t;

    // leading slash -> prefix backend host
    if (t.startsWith("/")) return `${BASE_URL}${t}`;

    // bare filename like "thumbnail-..." -> public/temp/<file>
    if (/^thumbnail-/i.test(t)) return `${BASE_URL}/temp/${t}`;

    // if starts with temp/ -> prefix host
    if (/^temp\//i.test(t)) return `${BASE_URL}/${t}`;

    // fallback: prefix host
    return `${BASE_URL}/${t}`;
  } catch (err) {
    return `${BASE_URL}/placeholders/loading1.gif`;
  }
}

export {
    getPosterFromVideo,
    getThumbnailUrl,
    formatDuration,
    
}