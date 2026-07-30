import { describe, it, expect } from "vitest";
import { request, createUser, generateToken } from "./helpers.js";
import { Video } from "../../src/models/video.model.js";
import { Comment } from "../../src/models/comment.model.js";

async function createVideo(ownerId) {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return await Video.create({
    title: `Video ${uniqueId}`,
    description: `Desc ${uniqueId}`,
    videoFile: `https://res.cloudinary.com/demo/video_${uniqueId}.mp4`,
    thumbnail: `https://res.cloudinary.com/demo/image_${uniqueId}.jpg`,
    duration: 100,
    owner: ownerId,
  });
}

async function createComment(videoId, ownerId, overrides = {}) {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  return await Comment.create({
    content: `Comment ${uniqueId}`,
    video: videoId,
    owner: ownerId,
    likes: { count: 0, users: [] },
    replies: [],
    ...overrides,
  });
}

describe("POST /api/v1/comments/:videoId", () => {
  it("adds a comment to a video", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);

    const res = await request
      .post(`/api/v1/comments/${video._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Awesome explanation!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe("Awesome explanation!");
  });

  it("rejects comment submission when content is empty with 400", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);

    const res = await request
      .post(`/api/v1/comments/${video._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "   " });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/v1/comments/:videoId", () => {
  it("returns paginated list of comments for a video", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);
    await createComment(video._id, user._id);
    await createComment(video._id, user._id);

    const res = await request
      .get(`/api/v1/comments/${video._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(2);
  });
});

describe("GET /api/v1/comments/:videoId/count", () => {
  it("returns combined total of comments and replies", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);

    await createComment(video._id, user._id);
    await createComment(video._id, user._id);

    const res = await request
      .get(`/api/v1/comments/${video._id}/count`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(2);
  });
});

describe("POST /api/v1/comments/:id/replies", () => {
  it("adds a reply to an existing comment", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);
    const comment = await createComment(video._id, user._id);

    const res = await request
      .post(`/api/v1/comments/${comment._id}/replies`)
      .set("Authorization", `Bearer ${token}`)
      .send({ content: "Thanks for the feedback!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe("Thanks for the feedback!");
  });
});

describe("PATCH /api/v1/comments/:id/like", () => {
  it("toggles like count on a comment", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);
    const comment = await createComment(video._id, user._id);

    const res = await request
      .patch(`/api/v1/comments/${comment._id}/like`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(1);
  });
});

describe("DELETE /api/v1/comments/:id", () => {
  it("allows comment owner to delete their comment", async () => {
    const owner = await createUser();
    const token = generateToken(owner);
    const video = await createVideo(owner._id);
    const comment = await createComment(video._id, owner._id);

    const res = await request
      .delete(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects deletion attempt by non-owner with 403", async () => {
    const owner = await createUser();
    const attacker = await createUser({ role: "user" });
    const attackerToken = generateToken(attacker);
    const video = await createVideo(owner._id);
    const comment = await createComment(video._id, owner._id);

    const res = await request
      .delete(`/api/v1/comments/${comment._id}`)
      .set("Authorization", `Bearer ${attackerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
