/**
 * contentModerator.middleware.js — Express Middleware for NSFW Content Moderation
 *
 * Intercepts uploaded files AFTER Multer saves them to disk,
 * scans them through the nsfwjs AI model, and rejects any
 * content that violates community guidelines.
 *
 * Supports: images (JPEG, PNG, WebP), videos (MP4, WebM)
 * Also checks text fields (title, description) for profanity.
 */

import { scanImage, scanVideo, checkText } from "../utils/contentModerator.js";
import fs from "fs";

// MIME types that should be scanned
const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_MIMES = new Set(["video/mp4", "video/webm"]);

/**
 * Express middleware that scans all uploaded files for NSFW content.
 *
 * Usage in routes:
 *   router.post("/publish", upload.fields(...), moderateContent, controller);
 *
 * If ANY file or text field is flagged:
 *   - All uploaded temp files are deleted
 *   - Returns 400 with a clear rejection message
 *
 * If all content is safe:
 *   - Calls next() to continue to the controller
 */
export async function moderateContent(req, res, next) {
  try {
    // ── Step 1: Check text fields for profanity ──
    const textFields = ["title", "description", "name", "about"];
    for (const field of textFields) {
      if (req.body && req.body[field]) {
        const textResult = checkText(req.body[field]);
        if (!textResult.safe) {
          console.log(
            `🚫 Content rejected: profanity in "${field}" — flagged words: [${textResult.flaggedWords.join(", ")}]`
          );
          cleanupAllFiles(req);
          return res.status(400).json({
            success: false,
            message: `Content rejected: inappropriate language detected in ${field}. Please remove offensive words and try again.`,
          });
        }
      }
    }

    // ── Step 2: Collect all uploaded files ──
    const files = collectFiles(req);

    if (files.length === 0) {
      // No files to scan, continue
      return next();
    }

    // ── Step 3: Scan each file ──
    for (const file of files) {
      const mime = file.mimetype;
      const filePath = file.path;

      // Check if file still exists (might have been cleaned up)
      if (!fs.existsSync(filePath)) {
        continue;
      }

      if (IMAGE_MIMES.has(mime)) {
        // Scan image
        const result = await scanImage(filePath);
        if (!result.safe) {
          console.log(
            `🚫 Image rejected: ${result.flaggedCategory} (${(result.flaggedScore * 100).toFixed(1)}%) — ${file.originalname}`
          );
          cleanupAllFiles(req);
          return res.status(400).json({
            success: false,
            message:
              "Content rejected: the uploaded image violates our community guidelines. Adult or explicit content is not permitted.",
          });
        }
      } else if (VIDEO_MIMES.has(mime)) {
        // Scan video (multi-layer frame extraction)
        const result = await scanVideo(filePath);
        if (!result.safe) {
          const frame = result.flaggedFrame;
          console.log(
            `🚫 Video rejected at frame ${frame.frameIndex}/${frame.totalFrames}: ${frame.category} (${(frame.score * 100).toFixed(1)}%) — ${file.originalname}`
          );
          cleanupAllFiles(req);
          return res.status(400).json({
            success: false,
            message:
              "Content rejected: the uploaded video contains content that violates our community guidelines. Adult or explicit content is not permitted.",
          });
        }
      }
      // Other file types (shouldn't reach here due to Multer filter) are skipped
    }

    // All files passed moderation
    console.log(`✅ Content moderation passed: ${files.length} file(s) scanned.`);
    next();
  } catch (err) {
    console.error("❌ Content moderation error:", err.message);
    // On moderation system failure, allow the upload through
    // (fail-open to prevent blocking all uploads if the model crashes)
    // In production, you may want to fail-closed instead.
    next();
  }
}

/**
 * Collects all uploaded files from req.files (handles .single, .array, .fields).
 * @returns {Array<{mimetype: string, path: string, originalname: string}>}
 */
function collectFiles(req) {
  const files = [];

  if (req.file) {
    // upload.single()
    files.push(req.file);
  }

  if (req.files) {
    if (Array.isArray(req.files)) {
      // upload.array()
      files.push(...req.files);
    } else {
      // upload.fields() — req.files is an object { fieldname: [files] }
      for (const fieldFiles of Object.values(req.files)) {
        if (Array.isArray(fieldFiles)) {
          files.push(...fieldFiles);
        }
      }
    }
  }

  return files;
}

/**
 * Deletes all uploaded temp files from the request to prevent
 * rejected content from remaining on disk.
 */
function cleanupAllFiles(req) {
  const files = collectFiles(req);
  for (const file of files) {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (err) {
      console.warn(`⚠️ Could not delete temp file ${file.path}:`, err.message);
    }
  }
}
