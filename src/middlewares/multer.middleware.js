//multer.middleware.js

import multer from "multer";
// EU8u1.p2.a1.10ln - Thumbnai fixing 

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

 
const uploadDir = path.join(process.cwd(), "public", "temp");
fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(path.join(process.cwd(), "src", "public", "temp"), { recursive: true });


 
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".mp4",
  ".webm",
]);

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".sh",
  ".bat",
  ".cmd",
  ".js",
  ".mjs",
  ".php",
  ".py",
  ".html",
  ".htm",
  ".vbs",
  ".ps1",
  ".dll",
  ".so",
  ".jar",
]);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${safeExt}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return cb(
      new Error("Executable or unsafe file types are strictly prohibited"),
      false
    );
  }

  if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP images and MP4, WEBM videos are allowed"
      ),
      false
    );
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Max file size 100MB
  fileFilter: fileFilter,
});
