import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { request, createUser, generateToken, authedRequest } from "./helpers.js";

describe("POST /api/v1/account/signup", () => {
  it("creates a new user account with valid credentials", async () => {
    const payload = {
      name: "Alice Smith",
      email: "alice@example.com",
      password: "Password123!",
    };

    const res = await request.post("/api/v1/account/signup").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("alice@example.com");
  });

  it("rejects signup when required fields are missing", async () => {
    const res = await request.post("/api/v1/account/signup").send({ email: "incomplete@example.com" });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("rejects duplicate email with 409 conflict", async () => {
    const existing = await createUser({ email: "duplicate@example.com" });

    const res = await request.post("/api/v1/account/signup").send({
      name: "Different Name",
      email: existing.email,
      password: "Password123!",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/v1/account/login", () => {
  it("returns tokens for valid credentials", async () => {
    const rawPassword = "MySecretPassword123!";
    const user = await createUser({ password: rawPassword });

    const res = await request.post("/api/v1/account/login").send({
      email: user.email,
      password: rawPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects a wrong password with 400", async () => {
    const user = await createUser({ password: "CorrectPassword123!" });

    const res = await request.post("/api/v1/account/login").send({
      email: user.email,
      password: "WrongPassword123!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects non-existent email with 404", async () => {
    const res = await request.post("/api/v1/account/login").send({
      email: "nobody@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/v1/account/logout", () => {
  it("logs out the authenticated user", async () => {
    const user = await createUser();
    const token = generateToken(user);

    const res = await request
      .post("/api/v1/account/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("rejects logout request with no token with 401", async () => {
    const res = await request.post("/api/v1/account/logout");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/v1/account/refreshtoken", () => {
  it("refreshes access token with valid refresh token", async () => {
    const user = await createUser();
    const refreshToken = jwt.sign(
      { _id: user._id.toString() },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const res = await request
      .post("/api/v1/account/refreshtoken")
      .set("Cookie", [`refreshToken=${refreshToken}`])
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("rejects invalid refresh token with 401", async () => {
    const res = await request
      .post("/api/v1/account/refreshtoken")
      .send({ refreshToken: "invalid_refresh_token" });

    expect(res.status).toBe(401);
  });
});

describe("Authentication & Ownership Security", () => {
  it("rejects request with missing token with 401", async () => {
    const res = await request.get("/api/v1/account/me");

    expect(res.status).toBe(401);
  });

  it("rejects request with tampered token with 401", async () => {
    const tamperedToken = jwt.sign(
      { _id: new mongoose.Types.ObjectId().toString() },
      "wrong_secret"
    );

    const res = await request
      .get("/api/v1/account/me")
      .set("Authorization", `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
  });

  it("rejects request with expired token with 401", async () => {
    const user = await createUser();
    const expiredToken = jwt.sign(
      { _id: user._id.toString() },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "-1s" }
    );

    const res = await request
      .get("/api/v1/account/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  it("rejects modification of another user's account with 403 (IDOR protection)", async () => {
    const victimUser = await createUser({ role: "user" });
    const attackerUser = await createUser({ role: "user" });
    const attackerToken = generateToken(attackerUser);

    const res = await request
      .delete(`/api/v1/account/delete/${victimUser._id}`)
      .set("Authorization", `Bearer ${attackerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/i);
  });
});
