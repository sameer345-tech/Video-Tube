import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Video from "../models/video.model.js";
import { Subscription } from "../models/subscriptions.model.js";
import { Likes } from "../models/likes.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  // Count total videos
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // Aggregate total views
  const totalViewsData = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalViews =
    totalViewsData.length > 0 ? totalViewsData[0].totalViews : 0;

  // Count total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // Get all video IDs
  const videos = await Video.find({ owner: channelId }).select("_id");
  const videosId = videos.map((video) => video._id);

  // Count total likes (only if videos exist)
  let totalLikes = 0;
  if (videosId.length > 0) {
    totalLikes = await Likes.countDocuments({ video: { $in: videosId } });
  }

  // Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalVideos, totalViews, totalSubscribers, totalLikes },
        "Channel stats found successfully"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channelId");
  }
  const videos = await Video.find({ owner: channelId }).select(
    "videoFile title thumbnail -_id"
  );
  if (!videos) {
    throw new ApiError(400, "videos not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { videos }, "videos found successfully"));
});

export { getChannelStats, getChannelVideos };
