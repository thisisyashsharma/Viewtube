import { beforeAll, beforeEach, afterAll, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "supersecretkey";
process.env.REFRESH_TOKEN_SECRET = "anothersecretkey";
process.env.EMAIL_PREVERIFY_SECRET = "supersecretkey";
process.env.DEFAULT_STORAGE = "local";

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: "6.0.14" },
  });
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
}, 30000);

beforeEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
  vi.clearAllMocks();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
