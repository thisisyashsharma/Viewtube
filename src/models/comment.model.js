//EU9u1.p1.a1.30ln - Comment + Username 

import mongoose, { Schema } from "mongoose";

const replySchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: "newUser", required: true },
    likes: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: "newUser" }],
    },
    parentReply: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, _id: true }
);

const commentSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    video: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "newUser", required: true },
    likes: {
      count: { type: Number, default: 0 },
      users: [{ type: Schema.Types.ObjectId, ref: "newUser" }],
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

commentSchema.index({ video: 1, createdAt: -1 });

export const Comment = mongoose.model("Comment", commentSchema);
