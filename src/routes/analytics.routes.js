import { Router } from "express";
import { recordWatchEvent } from "../controllers/analytics.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/watch", verifyJWT, recordWatchEvent);

export default router;
