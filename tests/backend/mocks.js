import { vi } from "vitest";

export const mockCloudinaryUpload = vi.fn().mockImplementation(async (filePath) => {
  if (!filePath) return { error: "Local file path is required" };
  return {
    url: "http://res.cloudinary.com/demo/image/upload/v123/sample.jpg",
    secure_url: "https://res.cloudinary.com/demo/image/upload/v123/sample.jpg",
    public_id: "sample_public_id",
  };
});

export const mockSendMail = vi.fn().mockImplementation(async (options) => {
  return {
    accepted: [options.to],
    rejected: [],
    messageId: `<mock-${Date.now()}@mailer.test>`,
  };
});

export const mockDeleteFromGCS = vi.fn().mockResolvedValue(true);
export const mockRunUploadPipeline = vi.fn().mockResolvedValue({
  gcsVideoPath: "videos/user/sample.mp4",
  gcsThumbnailPath: "thumbnails/user/sample.jpg",
});
