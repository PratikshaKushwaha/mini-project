import mongoose from "mongoose";
import { Feedback } from "../models/feedback.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create feedback on an artwork (requires a completed order with the artist)
const createFeedback = asyncHandler(async (req, res) => {
    const { portfolioItemId, rating, comment } = req.body;

    if (!portfolioItemId || !rating) {
        throw new ApiError(400, "portfolioItemId and rating are required");
    }
    if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");

    const artwork = await PortfolioItem.findById(portfolioItemId);
    if (!artwork) throw new ApiError(404, "Artwork not found");

    // Verify client has a completed order with this artist
    const completedOrder = await CommissionOrder.findOne({
        clientId: req.user._id,
        artistId: artwork.artistId,
        status: 'completed'
    });

    if (!completedOrder) {
        throw new ApiError(403, "You can only leave feedback after a completed order with this artist");
    }

    // Prevent duplicate
    const existing = await Feedback.findOne({
        portfolioItemId,
        clientId: req.user._id
    });
    if (existing) throw new ApiError(400, "You have already left feedback on this artwork");

    const feedback = await Feedback.create({
        portfolioItemId,
        artistId: artwork.artistId,
        clientId: req.user._id,
        orderId: completedOrder._id,
        rating: parseInt(rating),
        comment
    });

    const populated = await Feedback.findById(feedback._id)
        .populate("clientId", "fullName username profileImage");

    return res.status(201).json(new ApiResponse(201, populated, "Feedback submitted"));
});

// Get all feedback for a specific artwork
const getFeedbackForArtwork = asyncHandler(async (req, res) => {
    const { portfolioItemId } = req.params;

    const feedbackList = await Feedback.find({ portfolioItemId })
        .populate("clientId", "fullName username profileImage")
        .sort({ createdAt: -1 });

    const stats = await Feedback.aggregate([
        { $match: { portfolioItemId: new mongoose.Types.ObjectId(portfolioItemId) } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, totalFeedback: { $sum: 1 } } }
    ]);

    return res.status(200).json(new ApiResponse(200, {
        feedback: feedbackList,
        stats: stats[0] || { avgRating: 0, totalFeedback: 0 }
    }, "Feedback fetched"));
});

// Toggle like on feedback (endorsement)
const likeFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) throw new ApiError(404, "Feedback not found");

    const userId = req.user._id;
    const alreadyLiked = feedback.likes.some(l => l.toString() === userId.toString());

    if (alreadyLiked) {
        feedback.likes = feedback.likes.filter(l => l.toString() !== userId.toString());
    } else {
        feedback.likes.push(userId);
    }
    await feedback.save();

    return res.status(200).json(new ApiResponse(200, {
        liked: !alreadyLiked,
        likeCount: feedback.likes.length
    }, alreadyLiked ? "Like removed" : "Feedback liked"));
});

export { createFeedback, getFeedbackForArtwork, likeFeedback };
