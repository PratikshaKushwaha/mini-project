import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { emailService } from "../utils/email.service.js";

const addPortfolioItem = asyncHandler(async (req, res) => {
    const { title, description, categoryId, price } = req.body;
    let mediaUrl = req.body.mediaUrl;
    
    // Check if an image file was uploaded
    if (req.file) {
        const cloudinaryUpload = await uploadOnCloudinary(req.file.buffer);
        if (!cloudinaryUpload) {
             throw new ApiError(500, "Error uploading image to Cloudinary");
        }
        mediaUrl = cloudinaryUpload.url;
    }

    if (!title || !mediaUrl) {
        throw new ApiError(400, "Title and media file/URL are required");
    }

    // Determine the user from auth middleware
    if (req.user.role !== 'artist') {
        throw new ApiError(403, "Only artists can add portfolio items");
    }

    const item = await PortfolioItem.create({
        artistId: req.user._id,
        title,
        description,
        mediaUrl,
        categoryId,
        price
    });

    // Send Upload Confirmation Email (Non-blocking)
    emailService.notifyArtworkUpload(req.user.email, title);

    return res.status(201).json(new ApiResponse(201, item, "Portfolio item created successfully"));
});

const getArtistPortfolio = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const items = await PortfolioItem.find({ artistId }).populate("categoryId");

    return res.status(200).json(new ApiResponse(200, items, "Portfolio items fetched successfully"));
});

const deletePortfolioItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let item = await PortfolioItem.findById(id);

    if (!item) {
        throw new ApiError(404, "Portfolio item not found");
    }

    if (item.artistId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to delete this item");
    }

    await PortfolioItem.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Portfolio item deleted successfully"));
});

const updatePortfolioItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, categoryId, price } = req.body;
    let mediaUrl = req.body.mediaUrl;

    if (req.file) {
        const cloudinaryUpload = await uploadOnCloudinary(req.file.buffer);
        if (cloudinaryUpload) {
             mediaUrl = cloudinaryUpload.url;
        }
    }

    let item = await PortfolioItem.findById(id);

    if (!item) {
        throw new ApiError(404, "Portfolio item not found");
    }

    if (item.artistId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this item");
    }

    const updates = { title, description, categoryId, price };
    if (mediaUrl) updates.mediaUrl = mediaUrl;

    item = await PortfolioItem.findByIdAndUpdate(id, updates, { new: true });

    return res.status(200).json(new ApiResponse(200, item, "Portfolio item updated successfully"));
});

export {
    addPortfolioItem,
    getArtistPortfolio,
    deletePortfolioItem,
    updatePortfolioItem
};
