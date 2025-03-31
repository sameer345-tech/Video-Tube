import asyncHandler from "../utils/asyncHandler.js";
import {ApiError }from "../utils/apiError.js";
import {Subscription} from  "../models/subscriptions.model.js";
import {ApiResponse }from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const userId = req.user?._id;
    
    if(channelId === userId.toString()) { 
        throw new ApiError(400, "you can not subscribe youself ")
    };

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    });

    if(existingSubscription) {
   const channelUnsubscribed =  await  Subscription.findByIdAndDelete(existingSubscription?._id)
  return res.status(200)
    .json(
        new ApiResponse(200, {channelUnsubscribed}, "channel unsubscribed successfully")
    )
    }
    else {
        const channelSubscribed = await Subscription.create({
            channel: channelId,
            subscriber: userId
        })
      return  res.status(200)
        .json(
            new ApiResponse(200, {channelSubscribed}, "channel subscribed successfully")
        )
    };
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channelId")
    };

 const subscribers = await  Subscription.find({
        channel: channelId
    }).select("subscriber -_id")
    .populate({path: "subscriber", select: "fullName userName email avatar"});

    if(subscribers.length === 0) {
        throw new ApiError(404, "subscribers  not found")
    }
    console.log( typeof subscribers[0]);
    
    return res.status(200)
           .json(
            new ApiResponse(200, {subscribers}, "subscribers found successfully. ")
           )
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if(!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "invalid subscriberId")
    };

 const subscribedChannels = await  Subscription.find({
        subscriber: subscriberId
    }).select("channel -_id")
    .populate({path: "channel", select: "fullName userName email avatar"});
    
    

    if(subscribedChannels.length === 0) {
        throw new ApiError(400, "subscribed channels not found")
    }

    return res.status(200)
           .json(
            new ApiResponse(200, {subscribedChannels}, "channels found successfully. ")
           )
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
