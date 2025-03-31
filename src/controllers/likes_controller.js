import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { Likes } from "../models/likes.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  const existingLiked = await Likes.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existingLiked) {
    const unlikedVideo = await Likes.findByIdAndDelete(
      existingLiked?._id
    ).select("video likedBy -_id");
    return res
      .status(200)
      .json(
        new ApiResponse(200, { unlikedVideo }, "video unliked successfully.")
      );
  } else {
    const likedVideo = await Likes.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    if (!likedVideo) {
      throw new ApiError(400, "video like failed");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { likedVideo }, "video liked successfully."));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id");
  }

  const existingLiked = await Likes.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingLiked) {
    const unlikedVideo = await Likes.findByIdAndDelete(
      existingLiked?._id
    ).select("comment likedBy -_id");
    return res
      .status(200)
      .json(
        new ApiResponse(200, { unlikedVideo }, "comment unliked successfully.")
      );
  } else {
    const likedComment = await Likes.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    if (!likedComment) {
      throw new ApiError(400, "comment like failed");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { likedComment }, "comment liked successfully.")
      );
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user?._id;

  const likedVideos = await Likes.find({
    likedBy: userId,
    video: { $ne: null },
  })
    .select("video -_id ")
    .populate({ path: "video", select: "videoFile title" });

  if (likedVideos.length === 0) {
    throw new ApiError(404, "No liked videos found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { likedVideos }, "liked video fetch successfully.")
    );
});

export { toggleCommentLike, toggleVideoLike, getLikedVideos };
