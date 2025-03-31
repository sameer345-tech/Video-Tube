import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { uploadFile } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import fs from "fs/promises";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  let filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId) {
    filter.userId = userId;
  }

  const sortOptions = {};
  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  const totalVideos = await Video.countDocuments(filter);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalVideos },
        "Videos fetched successfully"
      )
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

//   const video = await Video.aggregate([
//     { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
//     {
//       $lookup: {
//         from: "users",
//         localField: "owner",
//         foreignField: "_id",
//         as: "owner",
//       },
//     },
//     {
//       $project: {
//         "owner.password": 0,
//         "owner.refreshToken": 0,
//         "owner.__v": 0,
//       },
//     },
//   ]);

  const video = await Video.findById(videoId).populate({path: "owner", select: "-password -refreshToken"})
  if (!video) {
    throw new ApiError(400, "video not found");
  }
 
  video.views++;
  
  await video.save();
   
  res.status(200).json(new ApiResponse(200, video, "video found successfully"));
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!(title && description)) {
    throw new ApiError(404, "Please enter required credentials");
  }
  const existingVideo = await Video.findOne({
    title: title,
    description: description,
  });

  if (existingVideo) {
    throw new ApiError(400, "Video already exists");
  }
  const videoLocalPath = req.files?.video?.at(0)?.path;
  const thumLocalpath = req.files?.thumbnail?.at(0)?.path;

  if (!(videoLocalPath && thumLocalpath)) {
    throw new ApiError(400, "Video or thumbnail file is missing");
  }

  const video = await uploadFile(videoLocalPath, "video");
  const thumbnail = await uploadFile(thumLocalpath, "image");

  if (!(video.url && thumbnail.url)) {
    throw new ApiError(404, "video or thumbnail files is missing ");
  }
  await fs.unlink(videoLocalPath);
  await fs.unlink(thumLocalpath);
  const durationInSeconds = Number(video?.duration);

  const durationinMinutes = Math.floor(durationInSeconds / 60);

  const remainingSeconds = Math.floor(durationInSeconds % 60);

  const duration = `${durationinMinutes} min ${remainingSeconds} sec`;

  const createVideo = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    owner: req.user?._id,
    title,
    description,
    duration,
    isPublished: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { createVideo }, "video upload successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const thumbLocalPath = req.file?.path;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  let thumbnailUrl = "";
  if (thumbLocalPath) {
    const thumbnail = await uploadFile(thumbLocalPath, "image");
    await fs.unlink(thumbLocalPath);
    thumbnailUrl = thumbnail.url;
    if (!thumbnail.url) {
      throw new ApiError(400, "Something went wrong while uploading thumbnail");
    }
  }

  const updateData = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;
  if (thumbnailUrl) updateData.thumbnail = thumbnailUrl;

  const updatedData = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updateData,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedData, "video details successfully updated")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(400, "video not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedVideo: deletedVideo?.videoFile },
        "video deleted successfully"
      )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "video not found");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "video status updated successfully"));
});

export {
  publishVideo,
  getAllVideos,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getVideoById,
};
