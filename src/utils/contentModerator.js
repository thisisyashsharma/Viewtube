/**
 * contentModerator.js — NSFW Content Moderation Engine
 *
 * Uses nsfwjs (TensorFlow.js) to classify images into 5 categories:
 *   Porn, Hentai, Sexy, Drawing, Neutral
 *
 * For videos: extracts frames using FFmpeg (interval + keyframe sampling),
 * then scans each frame through the model.
 *
 * For text: checks titles/descriptions for explicit profanity.
 *
 * 100% free, self-hosted — no external API calls.
 */

import * as tf from "@tensorflow/tfjs";
import * as nsfw from "nsfwjs";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { Filter } = require("bad-words");

const execAsync = promisify(exec);

// ─── Configuration ───────────────────────────────────────────────
// Thresholds: if a category score exceeds this value, the content is rejected.
const THRESHOLDS = {
  Porn: 0.3,
  Hentai: 0.3,
  Sexy: 0.5,
};

// Video scanning: extract 1 frame every N seconds
const VIDEO_FRAME_INTERVAL_SECONDS = 2;

// Max frames to scan per video (safety cap for very long videos)
const MAX_FRAMES_PER_VIDEO = 300;

// Temp directory for extracted video frames
const FRAME_TEMP_DIR = path.join(process.cwd(), "public", "temp", "frames");

// ─── Model Cache ─────────────────────────────────────────────────
let nsfwModel = null;
let modelLoading = null;

/**
 * Loads the nsfwjs model once and caches it in memory.
 * Safe to call multiple times — returns cached model after first load.
 */
export async function initModel() {
  if (nsfwModel) return nsfwModel;
  if (modelLoading) return modelLoading;

  modelLoading = (async () => {
    console.log("🔍 Loading NSFW detection model...");
    tf.enableProdMode();
    nsfwModel = await nsfw.load("MobileNetV2");
    console.log("✅ NSFW detection model loaded and cached.");
    return nsfwModel;
  })();

  return modelLoading;
}

// ─── Text Profanity Filter ───────────────────────────────────────
const profanityFilter = new Filter();

/**
 * Checks text content for explicit/profane language.
 * @param {string} text - Text to check (title, description, etc.)
 * @returns {{ safe: boolean, flaggedWords: string[] }}
 */
export function checkText(text) {
  if (!text || typeof text !== "string") {
    return { safe: true, flaggedWords: [] };
  }

  const isProfane = profanityFilter.isProfane(text);

  if (isProfane) {
    const words = text.split(/\s+/);
    const flaggedWords = words.filter((w) => profanityFilter.isProfane(w));
    return { safe: false, flaggedWords };
  }

  return { safe: true, flaggedWords: [] };
}

// ─── Image Decoding (Pure JS — no native bindings needed) ────────

/**
 * Decodes a JPEG image buffer into raw RGBA pixel data.
 */
function decodeJpeg(buffer) {
  const rawData = jpeg.decode(buffer, { useTArray: true });
  return { data: rawData.data, width: rawData.width, height: rawData.height };
}

/**
 * Decodes a PNG image buffer into raw RGBA pixel data.
 */
function decodePng(buffer) {
  const png = PNG.sync.read(buffer);
  return { data: png.data, width: png.width, height: png.height };
}

/**
 * Converts raw RGBA pixel data into a 3-channel (RGB) TensorFlow tensor.
 * nsfwjs expects a 3D tensor [height, width, 3].
 */
function imageDataToTensor(imageData) {
  const { data, width, height } = imageData;
  const numPixels = width * height;
  const rgbValues = new Int32Array(numPixels * 3);

  for (let i = 0; i < numPixels; i++) {
    rgbValues[i * 3] = data[i * 4];       // R
    rgbValues[i * 3 + 1] = data[i * 4 + 1]; // G
    rgbValues[i * 3 + 2] = data[i * 4 + 2]; // B
    // Skip alpha channel (i * 4 + 3)
  }

  return tf.tensor3d(rgbValues, [height, width, 3], "int32");
}

/**
 * Reads an image file and converts it to a TensorFlow tensor.
 * Supports JPEG and PNG formats.
 */
function readImageAsTensor(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();

  let imageData;

  if (ext === ".jpg" || ext === ".jpeg") {
    imageData = decodeJpeg(buffer);
  } else if (ext === ".png") {
    imageData = decodePng(buffer);
  } else if (ext === ".webp") {
    // WebP is not natively supported by jpeg-js/pngjs.
    // FFmpeg extracts frames as JPG, so this path is rarely hit.
    // For WebP uploads, we skip scanning (fail-open).
    return null;
  } else {
    return null;
  }

  return imageDataToTensor(imageData);
}

// ─── Image Scanning ──────────────────────────────────────────────

/**
 * Scans a single image file for NSFW content.
 * @param {string} filePath - Absolute path to the image file
 * @returns {{ safe: boolean, predictions: object[], flaggedCategory: string|null, flaggedScore: number|null }}
 */
export async function scanImage(filePath) {
  const model = await initModel();

  const imageTensor = readImageAsTensor(filePath);

  if (!imageTensor) {
    // Could not decode image — fail-open
    return { safe: true, predictions: [], flaggedCategory: null, flaggedScore: null };
  }

  try {
    const predictions = await model.classify(imageTensor);

    // Check against thresholds
    const flagged = predictions.find((p) => {
      const threshold = THRESHOLDS[p.className];
      return threshold !== undefined && p.probability > threshold;
    });

    return {
      safe: !flagged,
      predictions,
      flaggedCategory: flagged ? flagged.className : null,
      flaggedScore: flagged ? flagged.probability : null,
    };
  } finally {
    // Always clean up tensor to prevent memory leaks
    imageTensor.dispose();
  }
}

// ─── Video Scanning ──────────────────────────────────────────────

/**
 * Gets video duration in seconds using FFprobe.
 */
async function getVideoDuration(videoPath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`
    );
    return parseFloat(stdout.trim()) || 0;
  } catch {
    console.warn("⚠️ Could not determine video duration, using fallback.");
    return 60;
  }
}

/**
 * Extracts frames from a video at regular intervals.
 * Uses FFmpeg to grab 1 frame every N seconds, scaled down to 224x224.
 */
async function extractIntervalFrames(videoPath, outputDir, intervalSeconds) {
  const fps = 1 / intervalSeconds;
  const outputPattern = path.join(outputDir, "interval_%04d.jpg");

  try {
    await execAsync(
      `ffmpeg -i "${videoPath}" -vf "fps=${fps},scale=224:224" -q:v 2 -y "${outputPattern}" -loglevel error`
    );
  } catch (err) {
    console.warn("⚠️ Interval frame extraction partial failure:", err.message);
  }

  return getFrameFiles(outputDir, "interval_");
}

/**
 * Extracts I-frames (keyframes / scene changes) from a video.
 * These represent moments where the visual content changes significantly.
 */
async function extractKeyframes(videoPath, outputDir) {
  const outputPattern = path.join(outputDir, "keyframe_%04d.jpg");

  try {
    await execAsync(
      `ffmpeg -i "${videoPath}" -vf "select='eq(pict_type\\,PICT_TYPE_I)',scale=224:224" -vsync vfr -q:v 2 -y "${outputPattern}" -loglevel error`
    );
  } catch (err) {
    console.warn("⚠️ Keyframe extraction partial failure:", err.message);
  }

  return getFrameFiles(outputDir, "keyframe_");
}

/**
 * Lists extracted frame files in a directory matching a prefix.
 */
function getFrameFiles(dir, prefix) {
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(prefix) && f.endsWith(".jpg"))
      .map((f) => path.join(dir, f))
      .sort();
  } catch {
    return [];
  }
}

/**
 * Scans a video file for NSFW content using multi-layer frame extraction.
 *
 * Layer 1: Interval sampling (1 frame every 2 seconds)
 * Layer 2: I-frame / keyframe extraction (scene transitions)
 * Layer 3: Merge frames and scan each through nsfwjs
 *
 * @param {string} videoPath - Absolute path to the video file
 * @returns {{ safe: boolean, framesScanned: number, flaggedFrame: object|null }}
 */
export async function scanVideo(videoPath) {
  const videoId = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
  const frameDir = path.join(FRAME_TEMP_DIR, videoId);
  fs.mkdirSync(frameDir, { recursive: true });

  try {
    const duration = await getVideoDuration(videoPath);
    console.log(`🎬 Scanning video (${Math.round(duration)}s) for NSFW content...`);

    // Layer 1: Extract interval frames
    const intervalFrames = await extractIntervalFrames(
      videoPath,
      frameDir,
      VIDEO_FRAME_INTERVAL_SECONDS
    );

    // Layer 2: Extract keyframes (scene changes)
    const keyframes = await extractKeyframes(videoPath, frameDir);

    // Layer 3: Merge all unique frames
    const allFrames = [...new Set([...intervalFrames, ...keyframes])];
    const framesToScan = allFrames.slice(0, MAX_FRAMES_PER_VIDEO);

    console.log(
      `   📸 Extracted ${intervalFrames.length} interval + ${keyframes.length} keyframes = ${framesToScan.length} frames to scan`
    );

    if (framesToScan.length === 0) {
      console.warn("⚠️ No frames could be extracted from video. Allowing upload.");
      return { safe: true, framesScanned: 0, flaggedFrame: null };
    }

    // Scan each frame
    for (let i = 0; i < framesToScan.length; i++) {
      const framePath = framesToScan[i];
      try {
        const result = await scanImage(framePath);

        if (!result.safe) {
          console.log(
            `   🚫 NSFW detected in frame ${i + 1}/${framesToScan.length}: ${result.flaggedCategory} (${(result.flaggedScore * 100).toFixed(1)}%)`
          );
          return {
            safe: false,
            framesScanned: i + 1,
            flaggedFrame: {
              frameIndex: i + 1,
              totalFrames: framesToScan.length,
              category: result.flaggedCategory,
              score: result.flaggedScore,
              predictions: result.predictions,
            },
          };
        }
      } catch (err) {
        console.warn(`   ⚠️ Skipping frame ${i + 1}: ${err.message}`);
        continue;
      }
    }

    console.log(`   ✅ Video passed: ${framesToScan.length} frames scanned, all safe.`);
    return { safe: true, framesScanned: framesToScan.length, flaggedFrame: null };
  } finally {
    cleanupFrames(frameDir);
  }
}

/**
 * Recursively deletes extracted frame files and their directory.
 */
function cleanupFrames(dir) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn(`⚠️ Could not clean up frame directory ${dir}:`, err.message);
  }
}

// ─── Initialization ──────────────────────────────────────────────
// Pre-load the model when this module is imported (skip in test environment)
if (process.env.NODE_ENV !== "test") {
  initModel().catch((err) => {
    console.error("❌ Failed to load NSFW model:", err.message);
  });
}
