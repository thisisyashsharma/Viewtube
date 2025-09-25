import { Router } from "express";
import { publishAVideo , getAllVideos , getAllUserVideos , deleteVideoById , VideoDataById , viewsIncrement, streamVideo  } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

//EU5u1.p1.2l - updated file - added two imports 
import fs from "fs";
import path from "path";


const router = Router();


const videoUpload = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'videoFile', maxCount: 1 },
    // { name: 'avatar', maxCount: 1 } // Add this if you are uploading avatar
  ]);

  router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/publish").post(videoUpload , publishAVideo )
router.route("/allVideo").get(getAllVideos)
router.route("/allUserVideo/:owner").get(getAllUserVideos)
router.route("/delete/:id").delete(deleteVideoById)
router.route("/videoData/:id").get(VideoDataById)
router.route("/incrementView/:id").put(viewsIncrement)

//EU5u1.p1.1l - added Stream route for local video playback
router.get("/stream/:filename", streamVideo);


export default router