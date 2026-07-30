import { getUserStorageUsage } from "../../services/quota.service.js";

const LIMIT_BYTES =
  Number(process.env.USER_STORAGE_LIMIT_MB || 100) * 1024 * 1024;

export async function validateQuotaStep(ctx) {
  const { userId, fileSize } = ctx;

  const usedBytes = await getUserStorageUsage(userId);

  if (usedBytes + fileSize > LIMIT_BYTES) {
    throw new Error("User storage quota exceeded (100MB limit)");
  }

  return ctx;
}
