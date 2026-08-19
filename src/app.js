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
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";

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

// ── Security Headers (Configured for OAuth Popups & Media) ──
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── Request Logging ──
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// ── Anti-Injection ──
app.use(mongoSanitize());
app.use(hpp());

app.use(defaultLimiter);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
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