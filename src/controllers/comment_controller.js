import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { log } from "node:console";

const createComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { comment }, "comment created successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  if (!content) {
    throw new ApiError(400, "Please enter comment");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(400, "comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(400, "comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "comment deleted successfully"));
});

const getCommentById = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  const comment = await Comment.findById(commentId)
    .populate({ path: "owner", select: "-password -refreshToken" })
    .populate({ path: "video", select: "_id videoFile title" });
  if (!comment) {
    throw new ApiError(400, "comment not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment found successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Convert page and limit to numbers & validate them
  page = Number(page);
  limit = Number(limit);
  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    throw new ApiError(400, "Page and limit must be positive numbers");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Get comments with pagination
  const comments = await Comment.paginate({ video: videoId }, { page, limit });

  // If no comments found, send appropriate response
  if (!comments || comments.docs.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No comments found for this video"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

export {
  createComment,
  updateComment,
  deleteComment,
  getCommentById,
  getVideoComments,
};
