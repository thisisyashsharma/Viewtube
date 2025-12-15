// src/routes/download.routes.js  (ES module)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Video } from "../models/video.model.js"
const router = express.Router();

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Example: /api/download/:id  -> find file for id and force download
router.get("/download/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const videoMeta = await  Video.findById(id); // adjust to your model import
    if (!videoMeta || !videoMeta.videoFilePath) return res.status(404).send("Not found");

    // Ensure the stored path is absolute or build it relative to your project
    // If you store only filename, convert to absolute: path.join(__dirname, "..", "uploads", videoMeta.videoFilePath)
    const filePath = path.isAbsolute(videoMeta.videoFilePath)
      ? videoMeta.videoFilePath
      : path.join(__dirname, "..", "uploads", videoMeta.videoFilePath);

    // Use res.download so Express sets Content-Disposition: attachment
    res.download(filePath, `${videoMeta.title || id}.mp4`, (err) => {
      if (err) {
        console.error("Download error:", err);
        // If headers already sent, we can't change them; attempt a 500 if possible
        if (!res.headersSent) res.status(500).send("Download failed");
      }
    });
  } catch (err) {
    console.error("Download route failed:", err);
    res.status(500).send("Server error");
  }
});

export default router;
