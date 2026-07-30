import supertest from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { newUser } from "../../src/models/account.model.js";

export const request = supertest(app);

export async function createUser(overrides = {}) {
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const defaultUser = {
    name: `User ${uniqueId}`,
    email: `user_${uniqueId}@example.com`,
    password: "Password123!",
    username: `user_${uniqueId}`,
    avatar: "https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg",
    role: "user",
    isVerified: true,
  };

  return await newUser.create({ ...defaultUser, ...overrides });
}

export function generateToken(user) {
  if (user && typeof user.generateAccessToken === "function") {
    return user.generateAccessToken();
  }
  const secret = process.env.ACCESS_TOKEN_SECRET || "supersecretkey";
  return jwt.sign(
    {
      _id: user._id ? user._id.toString() : user,
      email: user.email || "test@example.com",
      name: user.name || "Test User",
    },
    secret,
    { expiresIn: "1d" }
  );
}

export function authedRequest(user) {
  const token = typeof user === "string" ? user : generateToken(user);
  const agent = supertest.agent(app);
  agent.set("Authorization", `Bearer ${token}`);
  return agent;
}
