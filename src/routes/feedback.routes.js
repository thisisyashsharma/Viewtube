import { Router } from "express";
import multer from "multer";
import { receiveFeedback } from "../controllers/feedback.controller.js";
import path from "path";
import fs from "fs";

const router = Router();

// Multer storage: write uploaded files to tmp folder first (or directly to public/feedback_photos)
const uploadDir = path.join(process.cwd(), "public", "feedback_photos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

/**
 * POST /api/v1/feedback
 * fields: title, description, photos[] (optional)
 */
router.post("/", upload.array("photos[]", 8), receiveFeedback);

export default router;
