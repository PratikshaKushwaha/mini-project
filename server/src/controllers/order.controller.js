import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createInternalNotification } from "./notification.controller.js";
import { sendArtistRequestNotification, sendStatusUpdateNotification } from "../utils/mail.service.js";

/** 
 * @constant VALID_TRANSITIONS
 * @description Defines the permissible state transitions for commission orders to ensure lifecycle integrity.
 * @private
 */
const VALID_TRANSITIONS = {
    pending: ["accepted", "rejected", "cancelled", "awaiting_price"],
    awaiting_price: ["price_quoted", "cancelled"],
    price_quoted: ["accepted", "cancelled"],
    accepted: ["in_progress", "cancelled"],
    in_progress: ["completed", "cancelled"],
    completed: [],
    rejected: [],
    cancelled: []
};

/**
 * @description Creates a new commission engagement between a client and an artist.
 * Supports direct portfolio-based purchases and custom requirement requests.
 * @route POST /api/v1/orders
 * @access Private
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { artistId, title, description, deadline, orderType, price, portfolioItemId } = req.body;

    const order = await CommissionOrder.create({
        clientId: req.user._id,
        artistId,
        title,
        description,
        deadline,
        orderType: orderType || "custom",
        price: orderType === "direct" ? price : undefined,
        portfolioItemId: orderType === "direct" ? portfolioItemId : undefined,
        status: orderType === "direct" ? "accepted" : "pending"
    });

    const populatedOrder = await CommissionOrder.findById(order._id)
        .populate("artistId", "fullName email")
        .populate("clientId", "fullName username");

    /** Unified alert via socket-alternative and strictly named email service */
    await createInternalNotification({
        recipient: artistId,
        sender: req.user._id,
        type: "ORDER_UPDATE",
        message: `New commission request: ${title}`,
        link: `/orders/${order._id}`
    });

    await sendArtistRequestNotification(
        populatedOrder.artistId.email,
        populatedOrder.clientId.fullName || populatedOrder.clientId.username,
        title
    );

    return res.status(201).json(new ApiResponse(201, order, "Order request created"));
});

/**
 * @description Aggregates orders for the authenticated entity (Artist or Client).
 * Supports filtering by status and context-aware role checks.
 * @route GET /api/v1/orders
 * @access Private
 */
export const getOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = {};

    if (req.user.role === 'artist') query.artistId = req.user._id;
    else if (req.user.role === 'client') query.clientId = req.user._id;

    if (status) query.status = status;

    const orders = await CommissionOrder.find(query)
        .populate("clientId", "fullName username profileImage")
        .populate("artistId", "fullName username profileImage")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched"));
});

/**
 * @description Fetches the complete state of a specific commission engagement.
 * @route GET /api/v1/orders/:id
 * @access Private
 */
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await CommissionOrder.findById(req.params.id)
        .populate("clientId", "fullName username email profileImage")
        .populate("artistId", "fullName username email profileImage");

    if (!order) throw new ApiError(404, "Order not found");

    const userId = req.user._id.toString();
    if (order.clientId._id.toString() !== userId &&
        order.artistId._id.toString() !== userId &&
        req.user.role !== 'admin') {
        throw new ApiError(403, "Access denied to third-party order");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched"));
});

/**
 * @description Orchestrates the status lifecycle of a commission.
 * Validates transitions and dispatches multi-channel notifications.
 * @route PATCH /api/v1/orders/:id/status
 * @access Private
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, deliverableFiles } = req.body;
    const order = await CommissionOrder.findById(req.params.id).populate("clientId artistId");

    if (!order) throw new ApiError(404, "Order not found");

    if (!VALID_TRANSITIONS[order.status].includes(status)) {
        throw new ApiError(400, `Invalid lifecycle transition from ${order.status} to ${status}`);
    }

    order.status = status;
    if (deliverableFiles) order.deliverableFiles = deliverableFiles;
    
    order.statusHistory.push({
        status,
        updatedBy: req.user._id,
        note: `Status updated to ${status}`
    });
    
    await order.save();

    const recipient = req.user._id.toString() === order.clientId._id.toString() ? order.artistId._id : order.clientId._id;
    
    await createInternalNotification({
        recipient,
        sender: req.user._id,
        type: "ORDER_UPDATE",
        message: `Order status moved to ${status.replace('_', ' ')}`,
        link: `/orders/${order._id}`
    });

    await sendStatusUpdateNotification(
        order.clientId.email,
        order.title,
        status
    );

    return res.status(200).json(new ApiResponse(200, order, "Status updated"));
});

/**
 * @description Enables artists to formalize a custom engagement with a pricing quote.
 * @route PATCH /api/v1/orders/:id/price
 * @access Restricted (Artist Only)
 */
export const setOrderPrice = asyncHandler(async (req, res) => {
    const { price } = req.body;
    const order = await CommissionOrder.findById(req.params.id);

    if (!order) throw new ApiError(404, "Order not found");
    if (order.artistId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized: Pricing restricted to assigned artist");
    }

    order.price = price;
    order.status = "price_quoted";

    order.statusHistory.push({
        status: "price_quoted",
        updatedBy: req.user._id,
        note: `Price quoted at ${price}`
    });

    await order.save();

    return res.status(200).json(new ApiResponse(200, order, "Price quote finalized"));
});
