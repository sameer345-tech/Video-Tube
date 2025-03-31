import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {ApiError} from "../utils/apiError.js"
import User from "../models/user.model.js"
import { refreshAccessToken } from "../controllers/user.controllers.js";
const verifyJwt = asyncHandler(async(req,res,next) => {
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
     
    if(!token){
     throw new ApiError(400,"Please login again. Unauthorize request")
    }
    const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
       throw new ApiError(400,"Unauthorize request")
     }
    req.user = user;
    next();
   } catch (error) {
    if(error.message === "jwt expired"){
      
     await refreshAccessToken(req,res,next)
    } else {
      throw new ApiError(400,error.message)

    }
   }


  
 
})

export {verifyJwt};