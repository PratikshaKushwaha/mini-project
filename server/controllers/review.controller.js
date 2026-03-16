import mongoose from "mongoose";
import { Review } from "../models/review.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createReview = asyncHandler(async (req, res) => {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
        throw new ApiError(400, "OrderId and Rating are required");
    }

    const order = await CommissionOrder.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.clientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the client who placed the order can review it");
    }

    if (order.status !== 'Completed') {
        throw new ApiError(400, "Reviews can only be submitted for completed orders");
    }

    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
        throw new ApiError(400, "Review already exists for this order");
    }

    const review = await Review.create({
        orderId,
        clientId: req.user._id,
        artistId: order.artistId,
        rating,
        comment
    });

    return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

const getArtistReviews = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const reviews = await Review.find({ artistId })
        .populate("clientId", "fullName profileImage email")
        .sort({ createdAt: -1 });

    // Calculate Average Rating
    const stats = await Review.aggregate([
        { $match: { artistId: new mongoose.Types.ObjectId(artistId) } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
    ]);

    return res.status(200).json(new ApiResponse(200, {
        reviews,
        stats: stats[0] || { avgRating: 0, totalReviews: 0 }
    }, "Reviews fetched successfully"));
});

export {
    createReview,
    getArtistReviews
};
