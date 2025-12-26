import mongoose, { Schema } from "mongoose";

const subscriptionEventSchema = new Schema(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: "newUser",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "newUser",
      required: true,
    },
    action: {
      type: String,
      enum: ["subscribe", "unsubscribe"],                     //default will be unsubscribe !
      required: true,
    },
    day: {                                                                     // leaving analytical, Is tracking the day of subscribing anywhere else needed?
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

subscriptionEventSchema.index({ channel: 1, day: 1 });

export const SubscriptionEvent =
  mongoose.model("SubscriptionEvent", subscriptionEventSchema);
