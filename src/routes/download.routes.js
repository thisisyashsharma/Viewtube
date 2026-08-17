// src/routes/download.routes.js  (ES module)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Video } from "../models/video.model.js"
const router = express.Router();

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { downloadLimiter } from "../middlewares/rateLimiter.middleware.js";

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GET /api/download/:id  -> find file for id and force download
router.get("/download/:id", downloadLimiter, verifyJWT, async (req, res) => {
  try {
    const id = req.params.id;
    const videoMeta = await Video.findById(id);
    if (!videoMeta || (!videoMeta.videoFilePath && !videoMeta.videoFile)) {
      return res.status(404).json({ success: false, message: "Video file not found" });
    }

    const rawPath = videoMeta.videoFilePath || videoMeta.videoFile;

    // Handle remote Cloudinary / GCS URLs
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return res.redirect(rawPath);
    }

    // Resolve local file path and prevent path traversal
    const safeFilename = path.basename(rawPath);
    const filePath = path.join(__dirname, "..", "public", "temp", safeFilename);

    res.download(filePath, `${videoMeta.title || id}.mp4`, (err) => {
      if (err && !res.headersSent) {
        console.error("Download error:", err);
        return res.status(500).json({ success: false, message: "Download failed" });
      }
    });
  } catch (err) {
    console.error("Download route failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Server error during download" });
    }
  }
});

export default router;
