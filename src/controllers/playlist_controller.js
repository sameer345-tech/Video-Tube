import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Playlist } from "../models/playList.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { log } from "node:console";

const createPlaylist = asyncHandler(async (req, res) => {
    
  const { name, description } = req.body;

  if (!(name || description)) {
    throw new ApiError(404, "name or description is missing");
  }
  const existingPlaylist = await Playlist.findOne({ name });
  if (existingPlaylist) {
    throw new ApiError(400, "playlist is already exist with same name");
  }

  const playListCreated = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!playListCreated) {
    throw new ApiError(500, "server error during creating playList");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { playListCreated }, "playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "invalid user id");
  }

  const playlists = await Playlist.find({ owner: userId })
    .populate([
      { path: "videos.video" },
      {
        path: "owner",
        select: "-password -refreshToken -coverImage -watchHistory",
      },
    ])
    .exec();
  if (!playlists) {
    throw new ApiError(400, "playlists not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlists }, "playlists found successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate([
      { path: "videos.video" },
      {
        path: "owner",
        select: "-password -refreshToken -coverImage -watchHistory",
      },
    ])
    .exec();
  if (!playlist) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "playlist found successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid object id");
  }

  const existingVideo = await Playlist.findOne({ "videos.video": videoId });
  if (existingVideo) {
    throw new ApiError(400, "video already exist in current playlist.");
  }

  const playList = await Playlist.findById(playlistId);

  if (!playList) {
    throw new ApiError(400, "playList not found.");
  }

  const videoAdded = await Playlist.findByIdAndUpdate(
    playList,
    {
      $set: {
        videos: {
          video: videoId,
        },
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videoAdded },
        "video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid object id");
  }

  const playList = await Playlist.findById(playlistId);
  if (!playList) {
    throw new ApiError(400, "playlist not found");
  }

  const videoExist = await Playlist.findOne({ "videos.video": videoId });
  if (!videoExist) {
    throw new ApiError(400, "video not found in playlist");
  }

  const removedVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: {
          video: videoId,
        },
      },
    },
    { new: true }
  );

  if (!removedVideo) {
    throw new ApiError(400, "failed to remove video.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { removedVideo }, "video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist id.");
  }

  const existingPlayList = await Playlist.findById(playlistId);
  if (!existingPlayList) {
    throw new ApiError(400, "playlist not found");
  }

  const deletedPlayList = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlayList) {
    throw new ApiError(400, "playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedPlayList },
        "playlist deleted successfully."
      )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "playList id is not valid");
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(400, "playlist not found or invalid playlist id");
  }
  const updatedPlayList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: updateData,
    },
    { new: true }
  );

  if (!updatePlaylist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedPlayList },
        "Playlist updated successfully."
      )
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
