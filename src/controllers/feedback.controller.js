import fs from "fs";
import path from "path";
import { ApiResponse } from "../utils/ApiResponse.utils.js";
import { ApiError } from "../utils/ApiError.utils.js";

// Ensure directory exists
const FEEDBACK_DIR = path.join(process.cwd(), "data", "feedbacks");
const PHOTO_DIR = path.join(process.cwd(), "public", "feedback_photos");
if (!fs.existsSync(FEEDBACK_DIR)) fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
if (!fs.existsSync(PHOTO_DIR)) fs.mkdirSync(PHOTO_DIR, { recursive: true });

const FEEDBACK_FILE = path.join(FEEDBACK_DIR, "feedbacks.txt");

// Helper: append a line (JSON) to feedback file
function appendFeedbackRecord(record) {
  const line = JSON.stringify(record) + "\n";
  fs.appendFileSync(FEEDBACK_FILE, line, { encoding: "utf8", flag: "a" });
}

const receiveFeedback = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();

    if (!title) throw new ApiError(400, "Title is required");
    if (!description) throw new ApiError(400, "Description is required");

    // req.files may contain photos[] (multer)
    const files = req.files?.["photos[]"] || req.files?.photos || [];

    // If multer stored files in memory or tmp location, move them into public/feedback_photos
    const savedPhotoPaths = [];
    for (const f of files) {
      // if multer stored file.path, move it; otherwise keep originalname
      if (f.path) {
        const dest = path.join(PHOTO_DIR, `${Date.now()}_${f.originalname}`);
        try {
          fs.renameSync(f.path, dest);
          // Make a public url path relative to express static root
          const publicPath = dest.split(path.join(process.cwd(), "public"))[1] || `/feedback_photos/${path.basename(dest)}`;
          savedPhotoPaths.push(publicPath.startsWith("/") ? publicPath : `/${publicPath}`);
        } catch (e) {
          // If rename fails (maybe because multer already used public folder), fallback to original path
          savedPhotoPaths.push(f.path || f.originalname);
        }
      } else {
        savedPhotoPaths.push(f.originalname);
      }
    }

    const record = {
      timestamp: new Date().toISOString(),
      title,
      description,
      photos: savedPhotoPaths,
      ip: req.ip || null,
      userAgent: req.get("User-Agent") || null,
    };

    appendFeedbackRecord(record);

    return res.status(201).json(new ApiResponse(201, { ok: true }, "Feedback saved"));
  } catch (err) {
    console.error("Feedback save failed:", err);
    const message = err?.message || "Failed to save feedback";
    const status = err instanceof ApiError ? err.statusCode || 400 : 500;
    return res.status(status).json({ success: false, message });
  }
};

export { receiveFeedback };
