import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (fileBuffer) => {
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

export { uploadOnCloudinary };
