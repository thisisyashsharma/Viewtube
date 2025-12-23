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


function getPosterFromVideo(video) {
  // Minimal stub fallback — use a "no-thumbnail" image you place in public/placeholders
  return "http://localhost:8000/placeholders/no-thumbnail.png";
}

function getThumbnailUrl(video) {
  try {
    let t = video?.thumbnail ?? "";
    if (typeof t === "object") t = t.url || t.path || t.filename || "";

    t = String(t).trim();

    if (!t) {
      const poster = getPosterFromVideo(video);
      return poster || "http://localhost:8000/placeholders/loading1.gif";
    }

    // remove stray '/public' if present
    t = t.replace("/public", "");

    // absolute url -> use as-is
    if (/^https?:\/\//i.test(t)) return t;

    // leading slash -> prefix backend host
    if (t.startsWith("/")) return `http://localhost:8000${t}`;

    // bare filename like "thumbnail-..." -> public/temp/<file>
    if (/^thumbnail-/i.test(t)) return `http://localhost:8000/temp/${t}`;

    // if starts with temp/ -> prefix host
    if (/^temp\//i.test(t)) return `http://localhost:8000/${t}`;

    // fallback: prefix host
    return `http://localhost:8000/${t}`;
  } catch (err) {
    return "http://localhost:8000/placeholders/loading1.gif";
  }
}

export {
    getPosterFromVideo,
    getThumbnailUrl,
    formatDuration,
    
}