import { Review } from "../models/review.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createInternalNotification } from "./notification.controller.js";

export const createReview = asyncHandler(async (req, res) => {
    const { orderId, rating, comment } = req.body;
    
    const order = await CommissionOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    
    if (order.clientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the client who placed the order can review it");
    }

    if (order.status !== "completed") {
        throw new ApiError(400, "Reviews can only be submitted for completed orders");
    }

    const existingReview = await Review.findOne({ orderId });
    if (existingReview) throw new ApiError(409, "Review already submitted for this order");

    const review = await Review.create({
        orderId,
        clientId: req.user._id,
        artistId: order.artistId,
        rating,
        comment
    });

    await createInternalNotification({
        recipient: order.artistId,
        sender: req.user._id,
        type: "REVIEW_RECEIVED",
        message: `You received a ${rating}-star review for "${order.title}"`,
        link: `/artists/${order.artistId}`
    });

    return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

export const getArtistReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ artistId: req.params.artistId })
        .populate("clientId", "fullName username profileImage")
        .sort({ createdAt: -1 });
    
    return res.status(200).json(new ApiResponse(200, reviews, "Reviews fetched"));
});
