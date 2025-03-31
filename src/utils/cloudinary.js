import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import { response } from "express";
import fs from "node:fs"

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET 
})

const uploadFile = async (filePath,format) => {
  try {
    if(!filePath) return false
  const response = await  cloudinary.uploader.upload(filePath,{
      resource_type: format,
    });
    console.log(`file is uploaded successfully ${response.url}`);
    return response
  } catch (error) {
    fs.unlink(filePath)
   console.log("file successfully deleted")
    console.log(error);
    return null;
  }
};

export {uploadFile}