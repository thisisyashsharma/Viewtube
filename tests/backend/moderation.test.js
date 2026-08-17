import { describe, it, expect, vi, beforeEach } from "vitest";
import { request, createUser, generateToken } from "./helpers.js";
import fs from "fs";
import path from "path";

// Mock the AI scanner to prevent actual model loading during tests
vi.mock("../../src/utils/contentModerator.js", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    scanImage: vi.fn(),
    scanVideo: vi.fn(),
  };
});

// Also mock Cloudinary so we don't upload if it passes
vi.mock("../../src/utils/cloudinary.js", () => ({
  uploadOnCloudinary: vi.fn().mockResolvedValue({
    url: "http://res.cloudinary.com/demo/image/upload/v123/sample.jpg",
    secure_url: "https://res.cloudinary.com/demo/image/upload/v123/sample.jpg",
    public_id: "sample_public_id",
  }),
}));

describe("Content Moderation Middleware (18+ Filter)", () => {
  const dummyThumbnail = Buffer.from("fake image bytes");
  const dummyVideo = Buffer.from("fake video bytes");

  beforeEach(async () => {
    const { scanImage, scanVideo } = await import("../../src/utils/contentModerator.js");
    scanImage.mockClear();
    scanVideo.mockClear();
    
    // Default mock implementation: everything is safe
    scanImage.mockResolvedValue({ safe: true });
    scanVideo.mockResolvedValue({ safe: true, framesScanned: 5 });
  });

  it("should allow a video upload with safe text, safe image, and safe video", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const { scanImage, scanVideo } = await import("../../src/utils/contentModerator.js");

    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "A beautiful day at the park")
      .field("description", "Just me walking my dog.")
      .field("storage", "local")
      .attach("thumbnail", dummyThumbnail, "thumb.jpg")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(scanImage).toHaveBeenCalled();
    expect(scanVideo).toHaveBeenCalled();
  });

  it("should block upload if title contains profanity (18+ text)", async () => {
    const user = await createUser();
    const token = generateToken(user);

    // Using a known bad word (bad-words package usually blocks 'fuck', 'shit', etc.)
    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "This is a fuck video") 
      .field("description", "Just me walking my dog.")
      .attach("thumbnail", dummyThumbnail, "thumb.jpg")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/inappropriate language detected in title/i);
  });

  it("should block upload if image thumbnail is classified as 18+ (Porn/Hentai/Sexy)", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const { scanImage } = await import("../../src/utils/contentModerator.js");

    // Mock the image scanner to detect NSFW content
    scanImage.mockResolvedValueOnce({
      safe: false,
      flaggedCategory: "Porn",
      flaggedScore: 0.95,
      predictions: []
    });

    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "A beautiful day at the park")
      .field("description", "Just me walking my dog.")
      .attach("thumbnail", dummyThumbnail, "thumb.jpg")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/adult or explicit content is not permitted/i);
  });

  it("should block upload if video file contains 18+ frames", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const { scanVideo } = await import("../../src/utils/contentModerator.js");

    // Mock the video scanner to detect NSFW content
    scanVideo.mockResolvedValueOnce({
      safe: false,
      framesScanned: 3,
      flaggedFrame: {
        frameIndex: 3,
        totalFrames: 10,
        category: "Hentai",
        score: 0.88,
      }
    });

    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "A beautiful day at the park")
      .field("description", "Just me walking my dog.")
      .attach("thumbnail", dummyThumbnail, "thumb.jpg")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/adult or explicit content is not permitted/i);
  });
});
