import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.utils.js";

const skipDevOrTest = (req) => {
  const isDevOrTest =
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development" ||
    !process.env.NODE_ENV;
  const isLocalhost =
    req.ip === "127.0.0.1" ||
    req.ip === "::1" ||
    req.ip === "::ffff:127.0.0.1" ||
    req.hostname === "localhost";

  return isDevOrTest || isLocalhost;
};

// Standard handler for rate limit exceed
const limitHandler = (message) => (req, res, next) => {
  throw new ApiError(429, message || "Too many requests. Please try again later.");
};

// Default rate limiter: 1000 requests per 15 minutes in production (skipped in dev/localhost)
export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevOrTest,
  handler: limitHandler("Too many requests from this IP. Please try again after 15 minutes."),
});


// Authentication rate limiter: 100 requests per minute in production (skipped in dev/localhost)
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevOrTest,
  handler: limitHandler("Too many authentication attempts. Please wait 1 minute before trying again."),
});

// OTP rate limiter: 20 requests per minute in production (skipped in dev/localhost)
export const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevOrTest,
  handler: limitHandler("Too many OTP requests. Please wait 1 minute before requesting another OTP."),
});

// Video Upload rate limiter: 50 requests per hour in production (skipped in dev/localhost)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevOrTest,
  handler: limitHandler("Upload limit reached (max 50 videos per hour). Please try again later."),
});

// Comment & Reply rate limiter: 100 requests per 15 minutes in production (skipped in dev/localhost)
export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDevOrTest,
  handler: limitHandler("Comment limit reached. Please wait before posting more comments."),
});

