//EU10u2.p5.a1.13ln - Email verification level 2 - preverify model
import mongoose from "mongoose";

const preverifySchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },  
  attempts: { type: Number, default: 0 },
}, { timestamps: true });

// optional TTL index (auto-clean)
preverifySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Preverify = mongoose.model("Preverify", preverifySchema);
