import { Message } from "../models/message.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { createInternalNotification } from "./notification.controller.js";

const sendMessage = asyncHandler(async (req, res) => {
    const { id: orderId } = req.params;
    const { message, attachments } = req.body;

    // Must have either a text message, an image upload, or both
    if (!message && !req.file) {
        throw new ApiError(400, "Either a text message or an image is required");
    }

    const order = await CommissionOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const isParticipant =
        order.artistId.toString() === req.user._id.toString() ||
        order.clientId.toString() === req.user._id.toString() ||
        req.user.role === 'admin';

    if (!isParticipant) throw new ApiError(403, "Not authorized to message on this order");

    let imageUrl = null;
    if (req.file) {
        const upload = await uploadOnCloudinary(req.file.buffer);
        if (!upload) throw new ApiError(500, "Image upload failed");
        imageUrl = upload.url;
    }

    const newMessage = await Message.create({
        orderId,
        senderId: req.user._id,
        message: message || null,
        imageUrl,
        attachments: attachments || []
    });

    // Notify the other party
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

    const populated = await Message.findById(newMessage._id).populate("senderId", "email fullName username profileImage");

    return res.status(201).json(new ApiResponse(201, populated, "Message sent successfully"));
});

const getOrderMessages = asyncHandler(async (req, res) => {
    const { id: orderId } = req.params;

    const order = await CommissionOrder.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const isParticipant =
        order.artistId.toString() === req.user._id.toString() ||
        order.clientId.toString() === req.user._id.toString() ||
        req.user.role === 'admin';

    if (!isParticipant) throw new ApiError(403, "Not authorized to view messages for this order");

    const messages = await Message.find({ orderId })
        .populate("senderId", "email fullName username profileImage")
        .sort({ createdAt: 1 });

    return res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export { sendMessage, getOrderMessages };
