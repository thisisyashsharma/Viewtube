import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
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

 

app.use("/api/v1/account", userAccount)
app.use("/api/v1/videos", videoRouter)

//EU9u1.p6.a1.1ln - Comment + Username  
app.use("/api/v1/comments", commentRouter);
 
            
// --------------------------------check any error--------------------------------
export { app }