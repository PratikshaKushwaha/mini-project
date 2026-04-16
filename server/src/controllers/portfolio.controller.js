import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendArtworkUploadConfirmation } from "../utils/mail.service.js";

/**
 * @controller PortfolioController
 * @description Orchestrates the creative showcase lifecycle for artists.
 */

/**
 * @description Publishes a new creative work to the artist's digital showcase.
 * Performs Cloudinary media ingestion and indexes metadata.
 * @route POST /api/v1/portfolio
 * @access Restricted (Artist Only)
 */
export const addPortfolioItem = asyncHandler(async (req, res) => {
    const { title, description, category, tags, startingPrice } = req.body;
    
    if (!req.file) throw new ApiError(400, "Artwork master file is required");

    const cloudinaryResponse = await uploadOnCloudinary(req.file.buffer);
    if (!cloudinaryResponse) throw new ApiError(500, "Media ingestion failed");

    const item = await PortfolioItem.create({
        artistId: req.user._id,
        title,
        description,
        category,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        imageUrl: cloudinaryResponse.url,
        price: startingPrice || 0
    });

    // Confirmation via strictly named email service
    await sendArtworkUploadConfirmation(req.user.email, title);

    return res.status(201).json(new ApiResponse(201, item, "Portfolio entry published"));
});

/**
 * @description Retrieves the published showcase for a targeted artist identity.
 * @route GET /api/v1/portfolio/:artistId
 * @access Public
 */
export const getPortfolioByArtist = asyncHandler(async (req, res) => {
    const items = await PortfolioItem.find({ artistId: req.params.artistId }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, items, "Portfolio collection fetched"));
});

/**
 * @description Modifies secondary metadata or availability states of a showcase item.
 * @route PATCH /api/v1/portfolio/:id
 * @access Restricted (Owner Only)
 */
export const updatePortfolioItem = asyncHandler(async (req, res) => {
    const { title, description, tags, isAvailable } = req.body;
    const item = await PortfolioItem.findById(req.params.id);

    if (!item) throw new ApiError(404, "Portfolio item not found");
    if (item.artistId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Ownership mismatch: Update restricted to original publisher");
    }

    if (title) item.title = title;
    if (description) item.description = description;
    if (tags) item.tags = tags.split(',').map(t => t.trim());
    if (typeof isAvailable !== 'undefined') item.isAvailable = isAvailable;

    await item.save();
    return res.status(200).json(new ApiResponse(200, item, "Portfolio item metadata updated"));
});

/**
 * @description Permanently retires a showcase item from the public platform.
 * @route DELETE /api/v1/portfolio/:id
 * @access Restricted (Owner Only)
 */
export const deletePortfolioItem = asyncHandler(async (req, res) => {
    const item = await PortfolioItem.findById(req.params.id);

    if (!item) throw new ApiError(404, "Portfolio item not found");
    if (item.artistId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized: Deletion restricted to artwork owner");
    }

    await item.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Portfolio item removed"));
});

/**
 * @description Toggles public appreciation (Like) for a creative showcase item.
 * @route POST /api/v1/portfolio/:id/like
 * @access Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
    const item = await PortfolioItem.findById(req.params.id);
    if (!item) throw new ApiError(404, "Portfolio item not found");

    const index = item.likes.indexOf(req.user._id);
    if (index === -1) item.likes.push(req.user._id);
    else item.likes.splice(index, 1);

    await item.save();
    return res.status(200).json(new ApiResponse(200, { likes: item.likes.length }, "Engagement status toggled"));
});
