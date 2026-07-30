import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import crypto from "crypto";
import { request, createUser, generateToken } from "./helpers.js";
import { User } from "../../src/models/account.model.js";
import { Video } from "../../src/models/video.model.js";

vi.mock("../../src/utils/mailer.utils.js", () => ({
  sendMail: vi.fn().mockResolvedValue({ accepted: ["user@example.com"] }),
}));

function sha256(s) {
  return crypto.createHash("sha256").update(String(s)).digest("hex");
}

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

describe("GET /api/v1/account/username/availability", () => {
  it("returns available: true when username is not taken", async () => {
    const res = await request.get("/api/v1/account/username/availability?username=brandnewuser");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.available).toBe(true);
  });

  it("returns available: false when username is already taken", async () => {
    const existing = await createUser({ username: "takenusername" });

    const res = await request.get(`/api/v1/account/username/availability?username=${existing.username}`);

    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);
  });
});

describe("PUT /api/v1/account/username", () => {
  it("updates username for authenticated user", async () => {
    const user = await createUser({ username: "oldusername" });
    const token = generateToken(user);

    const res = await request
      .put("/api/v1/account/username")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "newuniqueusername" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe("newuniqueusername");
  });

  it("rejects username update without token with 401", async () => {
    const res = await request
      .put("/api/v1/account/username")
      .send({ username: "newusername" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/account/userData/:id", () => {
  it("returns user details and excludes password hash", async () => {
    const user = await createUser();

    const res = await request.get(`/api/v1/account/userData/${user._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id.toString()).toBe(user._id.toString());
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.emailOtp).toBeUndefined();
  });

  it("returns 404 when user ID does not exist", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request.get(`/api/v1/account/userData/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/v1/account/validate-email", () => {
  it("returns syntaxValid: true for properly formatted email", async () => {
    const res = await request.get("/api/v1/account/validate-email?email=test@example.com");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.syntaxValid).toBe(true);
  });

  it("returns syntaxValid: false for invalid email format", async () => {
    const res = await request.get("/api/v1/account/validate-email?email=invalid-email");

    expect(res.status).toBe(200);
    expect(res.body.data.syntaxValid).toBe(false);
  });
});

describe("Email OTP Authentication Flow", () => {
  it("sends OTP code to user email address", async () => {
    const user = await createUser({ email: "otpuser@example.com", isVerified: false });

    const res = await request
      .post("/api/v1/account/send-email-otp")
      .send({ email: user.email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sent).toBe(true);
  });

  it("verifies correct OTP code and returns success", async () => {
    const otpCode = "654321";
    const user = await createUser({
      email: "verifyotp@example.com",
      isVerified: false,
      emailOtpHash: sha256(otpCode),
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    const res = await request
      .post("/api/v1/account/verify-email-otp")
      .send({ email: user.email, otp: otpCode });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ok).toBe(true);
  });

  it("rejects invalid or expired OTP code with 400", async () => {
    const user = await createUser({
      email: "badotp@example.com",
      isVerified: false,
      emailOtpHash: sha256("111111"),
      emailOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    const res = await request
      .post("/api/v1/account/verify-email-otp")
      .send({ email: user.email, otp: "999999" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Subscription Features", () => {
  it("toggles channel subscription for authenticated user", async () => {
    const subscriber = await createUser();
    const channel = await createUser({ username: "techchannel" });
    const token = generateToken(subscriber);

    // Subscribe
    const subRes = await request
      .put(`/api/v1/account/subscribe/${channel._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(subRes.status).toBe(200);
    expect(subRes.body.success).toBe(true);
    expect(subRes.body.data.subscribed).toBe(true);

    // Unsubscribe
    const unsubRes = await request
      .put(`/api/v1/account/subscribe/${channel._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(unsubRes.status).toBe(200);
    expect(unsubRes.body.data.subscribed).toBe(false);
  });

  it("returns channel subscription status for user", async () => {
    const subscriber = await createUser();
    const channel = await createUser({ username: "gamingchannel" });
    const token = generateToken(subscriber);

    const res = await request
      .get(`/api/v1/account/subscribe/status/${channel._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subscribed).toBe(false);
  });

  it("returns list of subscribed channels", async () => {
    const subscriber = await createUser();
    const token = generateToken(subscriber);

    const res = await request
      .get("/api/v1/account/subscriptions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.channels)).toBe(true);
  });
});

describe("Watch History Features", () => {
  it("adds video to user watch history and retrieves history list", async () => {
    const user = await createUser();
    const token = generateToken(user);
    const video = await createVideo(user._id);

    // Add to history
    const addRes = await request
      .put(`/api/v1/account/addToHistory/${video._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(addRes.status).toBe(200);
    expect(addRes.body.success).toBe(true);

    // Get watch history
    const getRes = await request
      .get("/api/v1/account/history")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(Array.isArray(getRes.body.data)).toBe(true);
  });
});
