import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export async function compressVideoStep(ctx) {
  if (!process.env.ENABLE_VIDEO_COMPRESSION || !ctx.videoFilePath) {
    return ctx;
  }

  const inputPath = ctx.videoFilePath;
  const outputPath = inputPath.replace(".mp4", "-compressed.mp4");

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-preset veryfast", "-crf 28"])
      .save(outputPath)
      .on("end", resolve)
      .on("error", reject);
  });

  fs.unlinkSync(inputPath);
  ctx.videoFilePath = outputPath;
  ctx.fileSize = fs.statSync(outputPath).size;

  return ctx;
}
