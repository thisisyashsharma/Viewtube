/**
 * moderateContent.step.js — GCS Pipeline Step for NSFW Content Moderation
 *
 * Scans video and thumbnail files for NSFW content before they are
 * uploaded to Google Cloud Storage. If flagged, throws an error to
 * halt the pipeline and prevent the content from being stored.
 */

import { scanImage, scanVideo, checkText } from "../../../utils/contentModerator.js";

export async function moderateContentStep(ctx) {
  console.log("🔍 [Pipeline] Running content moderation check...");

  // Check text fields
  if (ctx.title) {
    const titleCheck = checkText(ctx.title);
    if (!titleCheck.safe) {
      throw new Error(
        `Content rejected: inappropriate language detected in title. Flagged words: [${titleCheck.flaggedWords.join(", ")}]`
      );
    }
  }

  if (ctx.description) {
    const descCheck = checkText(ctx.description);
    if (!descCheck.safe) {
      throw new Error(
        `Content rejected: inappropriate language detected in description. Flagged words: [${descCheck.flaggedWords.join(", ")}]`
      );
    }
  }

  // Check thumbnail (image)
  if (ctx.thumbnailLocalPath) {
    const thumbResult = await scanImage(ctx.thumbnailLocalPath);
    if (!thumbResult.safe) {
      throw new Error(
        `Content rejected: thumbnail image flagged as ${thumbResult.flaggedCategory} (${(thumbResult.flaggedScore * 100).toFixed(1)}%).`
      );
    }
  }

  // Check video file
  if (ctx.videoLocalPath) {
    const videoResult = await scanVideo(ctx.videoLocalPath);
    if (!videoResult.safe) {
      const f = videoResult.flaggedFrame;
      throw new Error(
        `Content rejected: video flagged at frame ${f.frameIndex}/${f.totalFrames} as ${f.category} (${(f.score * 100).toFixed(1)}%).`
      );
    }
  }

  console.log("✅ [Pipeline] Content moderation passed.");
  return ctx;
}
