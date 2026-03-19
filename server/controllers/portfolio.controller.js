import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { emailService } from "../utils/email.service.js";

const addPortfolioItem = asyncHandler(async (req, res) => {
    const { title, description, categoryId, price, isAvailable } = req.body;
    let mediaUrl = null;

    if (req.file) {
        const upload = await uploadOnCloudinary(req.file.buffer);
        if (!upload) throw new ApiError(500, "Image upload to Cloudinary failed");
        mediaUrl = upload.url;
    }

    if (!title || !mediaUrl) {
        throw new ApiError(400, "Title and image file are required");
    }
    if (req.user.role !== 'artist') {
        throw new ApiError(403, "Only artists can add portfolio items");
    }

    const item = await PortfolioItem.create({
        artistId: req.user._id,
        title,
        description,
        mediaUrl,
        categoryId: categoryId || null,
        price: price ? parseFloat(price) : null,
        isAvailable: isAvailable !== 'false' // default true
    });

    emailService.notifyArtworkUpload(req.user.email, title);

    return res.status(201).json(new ApiResponse(201, item, "Artwork added to portfolio"));
});

const getArtistPortfolio = asyncHandler(async (req, res) => {
    const { artistId } = req.params;
    const { available } = req.query;

    const query = { artistId };
    if (available !== undefined) query.isAvailable = available === 'true';

    const items = await PortfolioItem.find(query)
        .populate("categoryId", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, items, "Portfolio fetched"));
});

const deletePortfolioItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await PortfolioItem.findById(id);
    if (!item) throw new ApiError(404, "Portfolio item not found");
    if (item.artistId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to delete this item");
    }
    await PortfolioItem.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, {}, "Portfolio item deleted"));
});

const updatePortfolioItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, categoryId, price, isAvailable } = req.body;

    let item = await PortfolioItem.findById(id);
    if (!item) throw new ApiError(404, "Portfolio item not found");
    if (item.artistId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to update this item");
    }

    let mediaUrl = item.mediaUrl;
    if (req.file) {
        const upload = await uploadOnCloudinary(req.file.buffer);
        if (upload) mediaUrl = upload.url;
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (categoryId !== undefined) updates.categoryId = categoryId || null;
    if (price !== undefined) updates.price = price ? parseFloat(price) : null;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable === 'true' || isAvailable === true;
    updates.mediaUrl = mediaUrl;

    item = await PortfolioItem.findByIdAndUpdate(id, updates, { new: true }).populate("categoryId", "name");

    return res.status(200).json(new ApiResponse(200, item, "Portfolio item updated"));
});

const toggleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await PortfolioItem.findById(id);
    if (!item) throw new ApiError(404, "Artwork not found");

    const userId = req.user._id;
    const alreadyLiked = item.likes.some(l => l.toString() === userId.toString());

    if (alreadyLiked) {
        item.likes = item.likes.filter(l => l.toString() !== userId.toString());
    } else {
        item.likes.push(userId);
    }
    await item.save();

    return res.status(200).json(new ApiResponse(200, {
        liked: !alreadyLiked,
        likeCount: item.likes.length
    }, alreadyLiked ? "Like removed" : "Artwork liked"));
});

const toggleAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await PortfolioItem.findById(id);
    if (!item) throw new ApiError(404, "Artwork not found");
    if (item.artistId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the artist can toggle availability");
    }
    item.isAvailable = !item.isAvailable;
    await item.save();
    return res.status(200).json(new ApiResponse(200, {
        isAvailable: item.isAvailable
    }, `Artwork marked as ${item.isAvailable ? 'available' : 'unavailable'}`));
});

export {
    addPortfolioItem,
    getArtistPortfolio,
    deletePortfolioItem,
    updatePortfolioItem,
    toggleLike,
    toggleAvailability
};
