import express from 'express';
import fs from "fs"
import "dotenv/config"
import { v2 as cloudinary } from "cloudinary"

let router = express.Router()

// cloudinary api keys
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// function to upload file on cloudinary
export const uploadOnCloudinary = async (localFilePath) => {

    try {

        if (!localFilePath) {
            console.log("no file");
            return null
        }

        // upload file
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })

        // public url
        console.log("file uploaded: ", response.url);

        // remove the locally saved file on server
        fs.unlink(localFilePath, (unlinkError) => {
            if (unlinkError) {
                console.error("Error removing local file:", unlinkError);
            }
        });

        // return a response
        return response;

    } catch (error) {

        console.log(error);
        
        // remove the locally saved file on server
        fs.unlinkSync(localFilePath)
        return null;

    }
}