// /mnt/data/like.routes.js


import express from "express";
import {getMyLikedVideos} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { likeLimiter } from "../middlewares/rateLimiter.middleware.js";

// GET liked videos for authenticated user
const router = express.Router();
router.get("/likes", likeLimiter, verifyJWT, getMyLikedVideos);

export default router;
