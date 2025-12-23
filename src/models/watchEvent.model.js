import mongoose, { Schema } from "mongoose";

const watchEventSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "newUser",
      required: true,
      index: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },

    // how many seconds watched in this session
    watchedSeconds: {
      type: Number,
      required: true,
      min: 1,
    },

    // logical date bucket (UTC midnight)
    day: {
      type: Date,
      required: true,
      index: true,
    },

    // optional but powerful
    sessionId: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

// compound index for aggregation speed
watchEventSchema.index({ video: 1, day: 1 });
watchEventSchema.index({ user: 1, day: 1 });

export const WatchEvent = mongoose.model(
  "WatchEvent",
  watchEventSchema
);
