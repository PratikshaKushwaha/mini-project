import { Message } from "../models/message.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { createInternalNotification } from "./notification.controller.js";

/**
 * @description Fetch messages for a specific order.
 * @route GET /api/v1/messages/:orderId
 * @access Private
 */
export const getMessages = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    
    const order = await CommissionOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    /** Access check */
    if (order.clientId.toString() !== req.user._id.toString() && 
        order.artistId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
        throw new ApiError(403, "Unauthorized access to order messages");
    }

    const messages = await Message.find({ orderId })
        .populate("senderId", "fullName username profileImage")
        .sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

/**
 * @description Send a message within a specific order.
 * @route POST /api/v1/messages/:orderId
 * @access Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { message: messageText } = req.body;

    const order = await CommissionOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    if (order.clientId.toString() !== req.user._id.toString() && 
        order.artistId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to send messages to this order");
    }

    let attachmentUrl = null;
    if (req.file) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.buffer);
        if (cloudinaryResponse) attachmentUrl = cloudinaryResponse.url;
    }

    const messageDoc = await Message.create({
        orderId,
        senderId: req.user._id,
        message: messageText,
        attachments: attachmentUrl ? [attachmentUrl] : []
    });

    const populatedMessage = await messageDoc.populate("senderId", "fullName username profileImage");

    const io = req.app.get("io");
    if (io) {
        io.to(orderId).emit("receive_message", populatedMessage);
    }

    const recipient = req.user._id.toString() === order.clientId.toString() ? order.artistId : order.clientId;

    await createInternalNotification({
        recipient,
        sender: req.user._id,
        type: "NEW_MESSAGE",
        message: `New message for order: ${order.title}`,
        link: `/orders/${order._id}`
    });

    return res.status(201).json(new ApiResponse(201, populatedMessage, "Message sent"));
});
