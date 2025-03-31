import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import { uploadFile } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import fs from "fs/promises"; 
import jwt from "jsonwebtoken"
import { log } from "console";
const generateAccessAndRefreshToken = async (userId)=> {
 try {
  const user = await User.findById(userId)
  
 const accessToken = await user.generateAccessToken();
 const refreshToken =  await user.generateRefreshToken();
//  console.log(accessToken,refreshToken);
 
 user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })
 return {accessToken,refreshToken};
 } catch (error) {
  throw new ApiError(500,"error.message")
 }
}

const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;
// console.log(req.files)
  if (!userName || !fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    throw new ApiError(400, "This user is already registered");
  }

  const avatarLocalPath = req.files?.avatar?.at(0)?.path;
  const coverImageLocalPath = req.files?.coverImage?.at(0)?.path || null;

  if (!avatarLocalPath) {
   throw new ApiError(400, "Please upload a file");
  }

  // ✅ File Upload with Error Handling
  const avatar = await uploadFile(avatarLocalPath, "image");
  const coverImage = coverImageLocalPath ? await uploadFile(coverImageLocalPath, "image") : null;

  // ✅ File Deletion to Save Storage
  await fs.unlink(avatarLocalPath).catch((err) => console.error("Error deleting avatar:", err));
  if (coverImageLocalPath) {
    await fs.unlink(coverImageLocalPath).catch((err) => console.error("Error deleting cover image:", err));
  }

  // ✅ User Creation
  const registeredUser = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });
// console.log(registeredUser);

  // ✅ Proper API Response
  const { password: _, refreshToken, ...registeredUserData } = registeredUser._doc;
  res.status(201).json(new ApiResponse(201, registeredUserData, "User created successfully"));
});

const loginUser = asyncHandler(async (req,res) => {
  const { userName, email, password } = req.body;
// console.log(userName,email,password);
   
  if (!userName && !email) {
    throw new ApiError(400, "Your credentials are invalid");
  }

  const user = await User.findOne({ $or: [{ userName }, { email }] });
    
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect. Please enter the correct password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
   
  // console.log(accessToken,refreshToken);
  const { refreshToken: rToken, password: p, ...loggedInUser } = user._doc;
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async(req,res)=> {
 await User.findByIdAndUpdate(req.user._id,
    {$set: {refreshToken: undefined}},
    {new: true}
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res, next)=> {

const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

if(!incomingRefreshToken) {
  throw new ApiError(400,"unauthorized request")
}

const decodedToken = await jwt.verify(
  incomingRefreshToken,
  process.env.REFRESH_TOKEN_SECRET
)

const user = await User.findById(decodedToken?._id)

if(!user){
  throw new ApiError(401, "unauthorized request")
}

if(incomingRefreshToken != user?.refreshToken) {
  throw new ApiError(402, "invalid refresh token")
}

const options = {
  httpOnly: true,
  secure: true
}

const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user?._id)
next();

// uncomment if sending response is needed.

// return res
//        .status(200)
//        .cookie("accessToken", accessToken, options)
//        .cookie("refreshToken", refreshToken, options)
//        .json(
//         new ApiResponse(200, {accessToken, refreshToken}, "RefreshToken refreshed successfully")
//        );
});

const changePassword = asyncHandler(async(req, res) => {

  const {oldPassword, newPassword} = req.body;
  if(!(oldPassword && newPassword)) {
    throw new ApiError(404, "credentials are required")
  }
 const user = await User.findById(req.user?._id);

 const verifyPassword = await user.isPasswordCorrect(oldPassword);

 if(!verifyPassword) {
  throw new ApiError(404, "Your old password is incorrect")
 }

 user.password = newPassword.trim()
  await user.save()
 
 
return res
.status(200)
.json(
  new ApiResponse(200, {}, "Password updated successfully")
)
});

const getCurrentUser = asyncHandler(async(req, res) => {

  const currentUser = req.user;

  if(!currentUser) {
    throw new ApiError(404, "Please first login")
  }

return res
.status(200)
.json(
  new ApiResponse(200,{ user: req.user}, "user found successfully")
)
});

const updateAccountInfo = asyncHandler(async(req,res) => {

const  {fullName, email} = req.body;

if(!(fullName && email)) {
  throw new ApiError(404, "credentials are required")
};
const existingEmail = await User.findOne({email: email});

if(existingEmail) {
  throw new ApiError(400, "email address is already in use.")
}
const userId = req.user._id;

 const updatedInfo = await  User.findByIdAndUpdate(userId,{$set: {
  fullName: fullName,
  email: email
}}, {new: true}).select("-password -refreshToken")

return res
.status(200)
.json(
  new ApiResponse(200, updatedInfo, "userName & email changed successfully")
);


});

const updateAwatar = asyncHandler(async(req,res) => {
   const avatarLocalPath = req.file?.path
   if(!avatarLocalPath) {
    throw new ApiError(404, "avatar is missing");
   }

  const avatar = await uploadFile(avatarLocalPath, "image")
  if(!avatar?.url) {
    throw new ApiError(400, "please upload avatar")
  }

 const userId = req.user._id;
 
 const user = await User.findByIdAndUpdate(userId,
  {$set: {
    avatar: avatar?.url
  }},
  {new: true}
 ).select("-password");
 
 await fs.unlink(avatarLocalPath)

 return res
 .status(200)
 .json(
  new ApiResponse(200, {user}, "avatar image updated successfully")
 );

});
const updateCoverImage = asyncHandler(async(req,res) => {
   const coverImageLocalPath = req.file?.path
   if(!coverImageLocalPath) {
    throw new ApiError(404, "cover image is missing");
   }

  const coverImage = await uploadFile(coverImageLocalPath, "image")
  if(!coverImage?.url) {
    throw new ApiError(400, "please upload cover image")
  }
 await fs.unlink(coverImageLocalPath)

 const userId = req.user._id;
 
 const user = await User.findByIdAndUpdate(userId,
  {$set: {
    coverImage: coverImage?.url
  }},
  {new: true}
 ).select("-password");

 return res
 .status(200)
 .json(
  new ApiResponse(200, {user}, "cover image updated successfully")
 );

});

const getUserProfile = asyncHandler(async(req,res) => {
   const {userName} = req.params;
   if(!userName) {
    throw new ApiError(400, "userName is missing in params")
   };

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        subscibedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      },
      
    },
    {
      $project: {
        userName: 1,
        fullName: 1,
        email: 1,
        subscribersCount: 1,
        subscibedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1
      }
    }
   ]);
  
   console.log(channel);
   
   if(!channel?.length) {
    throw new ApiError(400, "user does not exist")
   }

   return res
   .status(200)
   .json(
    new ApiResponse(200, channel[0], "user successfully fetched")
   )
   
});

const getWatcHistory = asyncHandler(async(req,res) => {

  const user = await User.aggregate([
    {
    $match: {
      _id: mongoose.type.ObjectId(req.user._id)
    }
  },
  {
    $lookup: {
      from: "videos",
      localField: "watchHistory",
      foreignField: "_id",
      as: "watchHistory",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  userName: 1,
                  fullName: 1,
                  avatar: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            owner: {
              $first: "$owner"
            }
          }
        }
      ]
    }
  }
])

if(!user) {
  throw new ApiError(404, "user not found")
}

return res
.status(200)
.json(
  new ApiResponse(200, user[0].watchHistory, "watch history fetched successfully")
)
});
export {registerUser,loginUser, logoutUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountInfo, updateAwatar, updateCoverImage, getUserProfile, getWatcHistory}
