import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/db/index.db.js";
import { newUser } from "../src/models/account.model.js";

async function run() {
  await connectDB();
  console.log("Syncing indexes for newUser...");
  await newUser.syncIndexes();
  console.log("Indexes synced.");
  process.exit(0);
}
run();
