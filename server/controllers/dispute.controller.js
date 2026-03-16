import { Dispute } from "../models/dispute.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createInternalNotification } from "./notification.controller.js";

const raiseDispute = asyncHandler(async (req, res) => {
    const { orderId, reason, explanation } = req.body;

    if (!orderId || !reason || !explanation) {
        throw new ApiError(400, "OrderId, reason, and explanation are required");
    }

    const order = await CommissionOrder.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Participation check
    if (order.artistId.toString() !== req.user._id.toString() &&
        order.clientId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Not authorized to dispute this order");
    }

    // Check if a dispute already exists
    const existingDispute = await Dispute.findOne({ orderId, status: { $ne: "Cancelled" } });
    if (existingDispute) {
        throw new ApiError(400, "A dispute is already active for this order");
    }

    const dispute = await Dispute.create({
        orderId,
        raisedBy: req.user._id,
        reason,
        explanation
    });

    // Alert Admin (Notification/Logs)
    // For now, let's just notify the other party
    const recipientId = req.user._id.toString() === order.artistId.toString() ? order.clientId : order.artistId;
    await createInternalNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: "ORDER_UPDATE",
        message: `A dispute has been raised for order #${orderId.toString().slice(-6)}`,
        link: `/orders/${orderId}`
    });

    return res.status(201).json(new ApiResponse(201, dispute, "Dispute raised successfully. An admin will review it."));
});

const getDisputes = asyncHandler(async (req, res) => {
    // Only admins can see all disputes
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admins can view all disputes");
    }

    const disputes = await Dispute.find()
        .populate("orderId", "status")
        .populate("raisedBy", "email fullName")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, disputes, "Disputes fetched successfully"));
});

const resolveDispute = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, resolution } = req.body; // Resolved, Cancelled

    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Only admins can resolve disputes");
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
        throw new ApiError(404, "Dispute not found");
    }

    dispute.status = status;
    dispute.resolution = resolution;
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Alert the parties
    const order = await CommissionOrder.findById(dispute.orderId);
    if (order) {
        const parties = [order.artistId, order.clientId];
        for (const partyId of parties) {
            await createInternalNotification({
                recipient: partyId,
                sender: req.user._id,
                type: "GENERAL",
                message: `Dispute for order #${order._id.toString().slice(-6)} has been ${status}`,
                link: `/orders/${order._id}`
            });
        }
    }

    return res.status(200).json(new ApiResponse(200, dispute, "Dispute resolved successfully"));
});

export {
    raiseDispute,
    getDisputes,
    resolveDispute
};
