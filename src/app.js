import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import 'dotenv/config';
const app = express()

 
import path from "path"; 
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
// app.use(express.static("public"))
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(cookieParser())

import userAccount from './routes/account.routes.js'
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js";
import likeRoutes from "./routes/like.routes.js";
import downloadRouter from "./routes/download.routes.js"
import feedbackRouter from "./routes/feedback.routes.js"
 

app.use("/api/v1/account", userAccount)
app.use("/api/v1/videos", videoRouter)

//EU9u1.p6.a1.1ln - Comment + Username  
app.use("/api/v1/comments", commentRouter);

//EU12u1.p3 - Like Page 
app.use("/api/v1", likeRoutes);

app.use("/api", downloadRouter)
app.use("/api/v1/feedback", feedbackRouter);
 
            
// --------------------------------check any error--------------------------------
export { app }