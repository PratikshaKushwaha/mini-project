import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20);

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
        { _id: id, recipient: req.user._id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { isRead: true }
    );

    return res.status(200).json(
        new ApiResponse(200, null, "All notifications marked as read")
    );
});

// Helper for internal use to create notifications
const createInternalNotification = async ({ recipient, sender, type, message, link }) => {
    try {
        await Notification.create({
            recipient,
            sender,
            type,
            message,
            link
        });
    } catch (error) {
        console.error("Internal Notification Error:", error);
    }
};

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createInternalNotification
};
