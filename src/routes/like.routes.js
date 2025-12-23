// /mnt/data/like.routes.js


import express from "express";
import {getMyLikedVideos} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

// GET liked videos for authenticated user
const router = express.Router();
router.get("/likes", verifyJWT, getMyLikedVideos);

export default router;
