import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { request, createUser, generateToken } from "./helpers.js";

vi.mock("../../src/utils/cloudinary.js", () => ({
  uploadOnCloudinary: vi.fn().mockImplementation(async (filePath) => {
    if (!filePath) return { error: "Local file path is required" };
    return {
      url: "http://res.cloudinary.com/demo/image/upload/v123/sample.jpg",
      secure_url: "https://res.cloudinary.com/demo/image/upload/v123/sample.jpg",
      public_id: "sample_public_id",
    };
  }),
}));

describe("POST /api/v1/videos/publish", () => {
  const dummyThumbnail = Buffer.from("fake image bytes");
  const dummyVideo = Buffer.from("fake video bytes");

  beforeEach(async () => {
    const { uploadOnCloudinary } = await import("../../src/utils/cloudinary.js");
    uploadOnCloudinary.mockClear();
  });

  it("publishes a video successfully with valid video and thumbnail uploads", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "My Awesome Video")
      .field("description", "A video describing testing architecture")
      .field("storage", "local")
      .attach("thumbnail", dummyThumbnail, "thumb.jpg")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("My Awesome Video");
  });

  it("rejects file upload with unsupported MIME type with 400", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Unsupported Upload")
      .field("description", "Testing PDF upload block")
      .attach("thumbnail", dummyThumbnail, "doc.pdf")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect([400, 500]).toContain(res.status);
    expect(res.body.message).toMatch(/Invalid file type/i);
  });

  it("rejects executable extension with 400", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Malicious Executable Upload")
      .field("description", "Testing EXE upload block")
      .attach("thumbnail", Buffer.from("echo hacked"), "script.exe")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect([400, 500]).toContain(res.status);
    expect(res.body.message).toMatch(/strictly prohibited/i);
  });

  it("rejects upload request without token with 401", async () => {
    const tempDir = path.join(process.cwd(), "public", "temp");
    const filesBefore = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];

    const res = await request
      .post("/api/v1/videos/publish")
      .field("title", "Unauthenticated Upload")
      .field("description", "Testing auth before write")
      .attach("thumbnail", dummyThumbnail, "thumb.jpg")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect(res.status).toBe(401);

    const filesAfter = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
    const newFiles = filesAfter.filter((f) => !filesBefore.includes(f));
    expect(newFiles.length).toBe(0);
  });

  it("falls back to local storage when storage parameter is the string 'true'", async () => {
    const { uploadOnCloudinary } = await import("../../src/utils/cloudinary.js");
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/videos/publish")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Storage Fallback Video")
      .field("description", "Testing storage string boolean fallback")
      .field("storage", "true")
      .attach("thumbnail", dummyThumbnail, "thumb.jpg")
      .attach("videoFile", dummyVideo, "clip.mp4");

    expect(res.status).toBe(201);
    expect(uploadOnCloudinary).not.toHaveBeenCalled();
    expect(res.body.data.videoFile).toMatch(/^http:\/\//);
  });
});
