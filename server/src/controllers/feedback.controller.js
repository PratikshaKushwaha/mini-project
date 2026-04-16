import { Feedback } from "../models/feedback.model.js";
import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const submitFeedback = asyncHandler(async (req, res) => {
    const { portfolioItemId, rating, comment } = req.body;

    const item = await PortfolioItem.findById(portfolioItemId);
    if (!item) throw new ApiError(404, "Portfolio item not found");

    const feedback = await Feedback.create({
        userId: req.user._id,
        portfolioItemId,
        rating,
        comment
    });

    return res.status(201).json(new ApiResponse(201, feedback, "Feedback submitted"));
});

export const getFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.find({ portfolioItemId: req.params.portfolioItemId })
        .populate("userId", "fullName username profileImage")
        .sort({ createdAt: -1 });
    
    return res.status(200).json(new ApiResponse(200, feedback, "Feedback fetched"));
});
