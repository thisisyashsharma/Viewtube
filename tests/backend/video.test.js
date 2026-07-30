import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { request, createUser, generateToken } from "./helpers.js";
import { Video } from "../../src/models/video.model.js";
import { Like } from "../../src/models/like.model.js";

async function createVideo(overrides = {}) {
  let ownerId = overrides.owner;
  if (!ownerId) {
    const owner = await createUser();
    ownerId = owner._id;
  }
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return await Video.create({
    title: `Test Video ${uniqueId}`,
    description: `Description for ${uniqueId}`,
    videoFile: `https://res.cloudinary.com/demo/video_${uniqueId}.mp4`,
    thumbnail: `https://res.cloudinary.com/demo/image_${uniqueId}.jpg`,
    duration: 120,
    views: 0,
    owner: ownerId,
    ...overrides,
  });
}

describe("GET /api/v1/videos/allVideo", () => {
  it("returns list of published videos", async () => {
    await createVideo();
    await createVideo();

    const res = await request.get("/api/v1/videos/allVideo");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe("GET /api/v1/videos/videoData/:id", () => {
  it("returns video metadata for a valid video ID", async () => {
    const video = await createVideo();

    const res = await request.get(`/api/v1/videos/videoData/${video._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id.toString()).toBe(video._id.toString());
  });

  it("returns 404 when video ID does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request.get(`/api/v1/videos/videoData/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/v1/videos/allUserVideo/:owner", () => {
  it("returns all videos created by specific user", async () => {
    const user = await createUser();
    await createVideo({ owner: user._id });
    await createVideo({ owner: user._id });

    const res = await request.get(`/api/v1/videos/allUserVideo/${user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it("returns 404 when user has no videos", async () => {
    const emptyUser = await createUser();

    const res = await request.get(`/api/v1/videos/allUserVideo/${emptyUser._id}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("PUT /api/v1/videos/incrementView/:id", () => {
  it("increments view count of specified video", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo({ views: 5 });

    const res = await request
      .put(`/api/v1/videos/incrementView/${video._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.views).toBe(6);
  });
});

describe("GET /api/v1/videos/search", () => {
  it("returns matching videos for valid search query", async () => {
    const user = await createUser();
    const token = generateToken(user);
    await createVideo({ title: "Node.js Microservices" });

    const res = await request
      .get("/api/v1/videos/search?query=Microservices")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.videos)).toBe(true);
  });

  it("rejects search request when query is empty with 400", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .get("/api/v1/videos/search?query=")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("PUT /api/v1/videos/:id/like", () => {
  it("toggles video like status for authenticated user", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo();

    // Like
    const likeRes = await request
      .put(`/api/v1/videos/${video._id}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(likeRes.status).toBe(200);
    expect(likeRes.body.data.liked).toBe(true);

    // Unlike
    const unlikeRes = await request
      .put(`/api/v1/videos/${video._id}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body.data.liked).toBe(false);
  });
});

describe("GET /api/v1/likes", () => {
  it("returns list of liked videos for authenticated user", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo();

    await Like.create({ video: video._id, likedBy: user._id });

    const res = await request
      .get("/api/v1/likes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});

describe("DELETE /api/v1/videos/delete/:id", () => {
  it("allows video owner to delete their video", async () => {
    const owner = await createUser();
    const token = generateToken(owner);
    const video = await createVideo({ owner: owner._id });

    const res = await request
      .delete(`/api/v1/videos/delete/${video._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects deletion attempt by non-owner with 403", async () => {
    const owner = await createUser();
    const nonOwner = await createUser({ role: "user" });
    const nonOwnerToken = generateToken(nonOwner);
    const video = await createVideo({ owner: owner._id });

    const res = await request
      .delete(`/api/v1/videos/delete/${video._id}`)
      .set("Authorization", `Bearer ${nonOwnerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
