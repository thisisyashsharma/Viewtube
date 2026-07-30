import mongoose, {Schema} from "mongoose";


const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        // ref: "User"     EU12u1.p1  - Liked Page
        ref: "newUser"
    },
  },
  { timestamps: true }
);

likeSchema.index({ video: 1, likedBy: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);