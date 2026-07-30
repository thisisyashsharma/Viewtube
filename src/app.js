import dns from "node:dns/promises";

if (process.env.NODE_ENV !== "test") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {
    // Ignore DNS setServer errors in isolated networks
  }
}


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import userAccount from "./routes/account.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import downloadRouter from "./routes/download.routes.js";
import feedbackRouter from "./routes/feedback.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

import { defaultLimiter } from "./middlewares/rateLimiter.middleware.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(defaultLimiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "src", "public")));
app.use("/temp", express.static(path.join(process.cwd(), "public", "temp")));
app.use("/temp", express.static(path.join(process.cwd(), "src", "public", "temp")));

app.use(cookieParser());

app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/account", userAccount);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1", likeRoutes);
app.use("/api", downloadRouter);
app.use("/api/v1/feedback", feedbackRouter);

// Centralized Error Handler
app.use(errorHandler);

export { app };