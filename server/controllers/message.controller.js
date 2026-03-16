import { Message } from "../models/message.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createInternalNotification } from "./notification.controller.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { id: orderId } = req.params;
    const { message, attachments } = req.body;

    if (!message) {
        throw new ApiError(400, "Message content is required");
    }

    const order = await CommissionOrder.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check participation
    if (order.artistId.toString() !== req.user._id.toString() &&
        order.clientId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to send a message to this order");
    }

    const newMessage = await Message.create({
        orderId,
        senderId: req.user._id,
        message,
        attachments
    });

    // Dispatch Notification
    const recipientId = req.user._id.toString() === order.artistId.toString() 
        ? order.clientId 
        : order.artistId;

    await createInternalNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: "NEW_MESSAGE",
        message: `New message on order #${orderId.toString().slice(-6)}`,
        link: `/orders/${orderId}`
    });

    return res.status(201).json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

const getOrderMessages = asyncHandler(async (req, res) => {
    const { id: orderId } = req.params;

    const order = await CommissionOrder.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.artistId.toString() !== req.user._id.toString() &&
        order.clientId.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to view messages for this order");
    }

    const messages = await Message.find({ orderId })
        .populate("senderId", "email fullName")
        .sort({ createdAt: 1 }); // Oldest first

    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export {
    sendMessage,
    getOrderMessages
};
