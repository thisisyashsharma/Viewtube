import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { request, createUser, generateToken } from "./helpers.js";
import { Video } from "../../src/models/video.model.js";

async function createVideo(ownerId, overrides = {}) {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return await Video.create({
    title: `Video ${uniqueId}`,
    description: `Desc ${uniqueId}`,
    videoFile: `https://res.cloudinary.com/demo/video_${uniqueId}.mp4`,
    thumbnail: `https://res.cloudinary.com/demo/image_${uniqueId}.jpg`,
    duration: 100,
    owner: ownerId,
    ...overrides,
  });
}

describe("POST /api/v1/feedback", () => {
  it("saves feedback submitted by authenticated user", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/feedback")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Great feature request")
      .field("description", "Please add transcript capabilities!");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Feedback saved/i);
  });

  it("rejects feedback submission when title or description is missing with 400", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/feedback")
      .set("Authorization", `Bearer ${token}`)
      .field("title", "Title only without description");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/download/:id", () => {
  it("redirects to remote video URL when video exists", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id, {
      videoFile: "https://res.cloudinary.com/demo/sample.mp4",
    });

    const res = await request
      .get(`/api/download/${video._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://res.cloudinary.com/demo/sample.mp4");
  });

  it("returns 404 when download video ID is not found", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request
      .get(`/api/download/${nonExistentId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/v1/analytics/watch", () => {
  it("records watch event analytics for authenticated user", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);

    const res = await request
      .post("/api/v1/analytics/watch")
      .set("Authorization", `Bearer ${token}`)
      .send({
        videoId: video._id.toString(),
        watchedSeconds: 60,
        sessionId: "session_abc123",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("rejects watch analytics payload missing required fields with 400", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/analytics/watch")
      .set("Authorization", `Bearer ${token}`)
      .send({ watchedSeconds: 60 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
