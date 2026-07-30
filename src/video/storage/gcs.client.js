import { Storage } from "@google-cloud/storage";
import path from "path";

const projectId = process.env.GCS_PROJECT_ID;
const keyFile = process.env.GCS_KEY_FILE;
const bucketName = process.env.GCS_BUCKET_NAME;

if (!projectId || !keyFile || !bucketName) {
  throw new Error("GCS env variables are missing");
}

const storage = new Storage({
  projectId,
  keyFilename: path.resolve(keyFile),
});

const bucket = storage.bucket(bucketName);

/**
 * Upload a file stream to GCS
 */
export async function uploadToGCS({
  fileStream,
  destination,
  contentType,
}) {
  return new Promise((resolve, reject) => {
if (!destination || typeof destination !== "string") {
  throw new Error(`Invalid GCS destination path: ${destination}`);
}

const file = bucket.file(destination);


    const writeStream = file.createWriteStream({
      resumable: false,
      contentType,
      metadata: {
        cacheControl: "private, max-age=0",
      },
    });

    fileStream
      .pipe(writeStream)
      .on("error", (err) => reject(err))
      .on("finish", () => {
        resolve({
          gcsPath: destination,
        });
      });
  });
}

/**
 * Delete object from GCS
 */
export async function deleteFromGCS(gcsPath) {
  await bucket.file(gcsPath).delete({ ignoreNotFound: true });
}

/**
 * Generate signed read URL (private playback)
 */
export async function getSignedReadUrl(gcsPath, expiresInMinutes = 10) {
  const [url] = await bucket.file(gcsPath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return url;
}
