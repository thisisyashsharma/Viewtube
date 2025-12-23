import mongoose, { Schema } from "mongoose";

const dailyChannelStatsSchema = new Schema(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: "newUser",
      index: true,
    },
    day: {
      type: Date,
      index: true,
    },

    views: { type: Number, default: 0 },
    watchSeconds: { type: Number, default: 0 },
    subscriberDelta: { type: Number, default: 0 },
  },
  { timestamps: true }
);

dailyChannelStatsSchema.index({ channel: 1, day: 1 }, { unique: true });

export const DailyChannelStats =
  mongoose.model("DailyChannelStats", dailyChannelStatsSchema);
