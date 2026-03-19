import multer from "multer";

// Use memory storage so files go directly to Cloudinary as buffers
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are accepted (jpeg, png, gif, webp)"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per file
    }
});