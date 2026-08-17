import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { receiveFeedback } from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { feedbackLimiter } from "../middlewares/rateLimiter.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { feedbackValidation } from "../middlewares/validate.middleware.js";
import { moderateContent } from "../middlewares/contentModerator.middleware.js";

const router = Router();

const uploadDir = path.join(process.cwd(), "public", "feedback_photos");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = new Set([".jpg", ".jpeg", ".png", ".webp"]);

  if (ALLOWED_IMAGE_MIMES.has(file.mimetype) && allowedExts.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid image format. Only JPG, PNG, and WEBP are allowed for feedback photos."),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per photo
  fileFilter,
});

/**
 * POST /api/v1/feedback
 * fields: title, description, photos[] (optional)
 */
router.post("/", feedbackLimiter, verifyJWT, upload.array("photos[]", 8), moderateContent, validate(feedbackValidation), receiveFeedback);

export default router;
