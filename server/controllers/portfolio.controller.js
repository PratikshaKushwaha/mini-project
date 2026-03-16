import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addPortfolioItem = asyncHandler(async (req, res) => {
    const { title, description, mediaUrl, categoryId, price } = req.body;

    if (!title || !mediaUrl) {
        throw new ApiError(400, "Title and mediaUrl are required");
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

    return res.status(201).json(new ApiResponse(201, item, "Portfolio item created successfully"));
});

const getArtistPortfolio = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const items = await PortfolioItem.find({ artistId }).populate("categoryId");

    return res.status(200).json(new ApiResponse(200, items, "Portfolio items fetched successfully"));
});

const deletePortfolioItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await PortfolioItem.findOne({ _id: id, artistId: req.user._id });

    if (!item) {
        throw new ApiError(404, "Portfolio item not found or you are not authorized");
    }

    await PortfolioItem.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Portfolio item deleted successfully"));
});

export {
    addPortfolioItem,
    getArtistPortfolio,
    deletePortfolioItem
};
