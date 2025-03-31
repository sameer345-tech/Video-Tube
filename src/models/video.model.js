import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
let videoSchema = mongoose.Schema({
   videoFile: {
    type: String,
    required: true
   },
   thumbnail: {
    type: String,
    required: true
   },
   owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
   },

   title: {
    type: String,
    required: true
   },

   description: {
    type: String,
    required: true
   },

   duration: {
    type: String,
    required: true,
    default: 0,
   },

   views: {
    type: Number,
    required: false,
    default: 0
   },

   isPublished: {
    type: Boolean,
    required: true,
    default: true
   },
},{Timestamp: true})
videoSchema.plugin(aggregatePaginate);
export default  mongoose.model("Video", videoSchema);