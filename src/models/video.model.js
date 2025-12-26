import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const  videoSchema = new Schema(
    {
        videoFile:{
            type: String,                         //URl
            required: true
        },
        thumbnail:{
            type: String,                         //URL 
            required: true
        },
        title:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        },
        duration:{
            type: Number,
            default: 0,
            // required: true
        },
        views:{
            type:Number,
            default:0
        },
        owner: {                                                                        //It could be named as User!?
            type: Schema.Types.ObjectId,
            ref: "newUser",
            required: true
        }

    },
    {
        timestamps: true
    }

)

// Method to increment views
videoSchema.methods.incrementViews = async function () {
    this.views++;
    await this.save();
  };

videoSchema.plugin(mongooseAggregatePaginate)

// Add this after schema definition, before model creation
videoSchema.index({ title: "text", description: "text" });
// Or for regular regex search (faster than text search for simple queries)
videoSchema.index({ title: 1 });
videoSchema.index({ description: 1 });

export const Video = mongoose.model("Video" , videoSchema)