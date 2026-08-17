 
import { validateQuotaStep } from "../pipeline/steps/validateQuota.step.js";
import { uploadToGCSStep } from "../pipeline/steps/uploadToGCS.step.js";
 
import { uploadThumbnailToGCSStep } from "../pipeline/steps/uploadThumbnailToGCS.step.js";
import { saveMetadataStep } from "../pipeline/steps/saveMetadata.step.js";
import { compressVideoStep } from "../pipeline/steps/compressVideo.step.js";
import { moderateContentStep } from "../pipeline/steps/moderateContent.step.js";

const STEPS = [
  moderateContentStep,
  validateQuotaStep,
  compressVideoStep,
  uploadToGCSStep,
  uploadThumbnailToGCSStep,
  saveMetadataStep,
];

export async function runUploadPipeline(initialCtx) {
  let ctx = { ...initialCtx };

  for (const step of STEPS) {
    ctx = await step(ctx);
  }

  return ctx;
}
