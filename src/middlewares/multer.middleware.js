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

// Magic byte signatures for allowed file types
const MAGIC_BYTES = {
  "image/jpeg": [Buffer.from([0xFF, 0xD8, 0xFF])],
  "image/png": [Buffer.from([0x89, 0x50, 0x4E, 0x47])],
  "image/webp": [], // checked via RIFF header below
  "video/mp4": [], // checked via ftyp box below
  "video/webm": [Buffer.from([0x1A, 0x45, 0xDF, 0xA3])],
};

/**
 * Validates a file's magic bytes match its claimed MIME type.
 * Returns true if the file passes validation, false otherwise.
 */
export async function validateMagicBytes(filePath, claimedMime) {
  try {
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);

    // JPEG: starts with FF D8 FF
    if (claimedMime === "image/jpeg") {
      return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
    }
    // PNG: starts with 89 50 4E 47
    if (claimedMime === "image/png") {
      return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
    }
    // WebP: starts with RIFF....WEBP
    if (claimedMime === "image/webp") {
      return buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
    }
    // MP4: has ftyp box (usually at byte 4)
    if (claimedMime === "video/mp4") {
      return buf.toString("ascii", 4, 8) === "ftyp";
    }
    // WebM: starts with 1A 45 DF A3 (EBML header)
    if (claimedMime === "video/webm") {
      return buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3;
    }

    return false;
  } catch {
    return false;
  }
}

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
