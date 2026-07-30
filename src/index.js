import dotenv from 'dotenv';
dotenv.config();
import connectDB from "./db/index.db.js";
import { app } from './app.js';
import 'dotenv/config';
import dns from "node:dns/promises";
dns.setServers(["8.8.8.8", "1.1.1.1"]);


import { validateEnvironment } from "./utils/envCheck.js";

validateEnvironment();

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    const server = app.listen(PORT, () => {
      console.log(`⚙️ Server is running at port : ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n Port ${PORT} is already in use.`);
        console.error(`   Run: taskkill /F /IM node.exe\n`);
        process.exit(1);
      }
      throw err;
    });
  })
  .catch((err) => console.log(err));