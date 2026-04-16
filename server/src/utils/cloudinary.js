import { v2 as cloudinary } from "cloudinary";

/**
 * @module CloudinaryUtility
 * @description Centralized configuration and helper for media uploads to Cloudinary.
 */
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * @description Uploads a file buffer directly to Cloudinary using a stream.
 * @param {Buffer} fileBuffer - The binary buffer of the file to upload.
 * @returns {Promise<Object|null>} The Cloudinary response object or null on failure.
 */
export const uploadOnCloudinary = async (fileBuffer) => {
    try {
        if (!fileBuffer) return null;
        
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "auto",
                    folder: "artisan_uploads"
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        return resolve(null);
                    }
                    resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });

    } catch (error) {
        console.error("Cloudinary upload utility error:", error);
        return null;
    }
}
