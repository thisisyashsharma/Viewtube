import mongoose from "mongoose";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import { Video } from "../models/video.model.js";

import { DB_NAME } from "../constants.js";

import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Resolve project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 LOAD ROOT .env EXPLICITLY
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

console.log("MONGODB_URI =", process.env.MONGODB_URI);
console.log("DB_NAME =", DB_NAME);

function getDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Math.floor(metadata?.format?.duration || 0));
    });
  });
}

const videos = await Video.find({ duration: 0 });

for (const video of videos) {
  try {
    const filename = path.basename(video.videoFile);

    const projectRoot = path.resolve(__dirname, "../../");

    const fullPath = path.join(projectRoot, "public", "temp", filename);

    if (!fs.existsSync(fullPath)) {
      console.log("❌ Missing file:", fullPath);
      continue;
    }

    const duration = await getDuration(fullPath);
    video.duration = duration;
    await video.save();

    console.log(`✅ Fixed: ${video.title} → ${duration}s`);
  } catch (e) {
    console.log(`❌ Failed: ${video.title}`, e.message);
  }
}

console.log("🎉 Duration migration completed");
process.exit();
