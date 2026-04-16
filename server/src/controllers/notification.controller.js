import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * @controller NotificationController
 * @description Manages user notifications for lifecycle events like order status changes and messages.
 */

/**
 * @description Retrieves the most recent 20 notifications for the authenticated user.
 * @route GET /api/v1/notifications
 * @access Private
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Notifications fetched successfully"),
    );
});

/**
 * @description Marks a specific notification as read.
 * @route PATCH /api/v1/notifications/:id/read
 * @access Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true },
    { new: true },
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

/**
 * @description Marks all unread notifications for the user as read.
 * @route PATCH /api/v1/notifications/mark-all
 * @access Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "All notifications marked as read"));
});

/**
 * @description Internal utility to create notifications without an API request.
 * Should be called by other controllers (e.g., Order, Message).
 * @param {Object} params - Notification parameters.
 * @param {string} params.recipient - ID of the user receiving the notification.
 * @param {string} [params.sender] - ID of the user triggering the notification.
 * @param {string} params.type - Category (e.g., 'order', 'message').
 * @param {string} params.message - Human-readable text.
 * @param {string} [params.link] - Redirect URL for the frontend.
 */
export const createInternalNotification = async ({
  recipient,
  sender,
  type,
  message,
  link,
}) => {
  try {
    await Notification.create({
      recipient,
      sender,
      type,
      message,
      link,
    });
  } catch (error) {
    console.error("Internal Notification Error:", error);
  }
};
