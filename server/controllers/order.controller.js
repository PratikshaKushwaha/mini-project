import { CommissionOrder } from "../models/commissionOrder.model.js";
import { PortfolioItem } from "../models/portfolioItem.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createInternalNotification } from "./notification.controller.js";
import { emailService } from "../utils/email.service.js";
import { User } from "../models/user.model.js";

// Valid transitions per order type
const VALID_TRANSITIONS = {
    // Custom order flow
    'pending':        ['awaiting_price', 'rejected', 'cancelled'],
    'awaiting_price': ['price_quoted', 'rejected', 'cancelled'],
    'price_quoted':   ['accepted', 'cancelled'],  // client accepts or cancels
    // Common path
    'accepted':       ['in_progress'],
    'in_progress':    ['completed'],
    'rejected':       [],
    'completed':      [],
    'cancelled':      []
};

// ─── Create Order ─────────────────────────────────────────────────────────────

const createOrder = asyncHandler(async (req, res) => {
    const { artistId, title, description, referenceFiles, deadline, orderType, portfolioItemId } = req.body;

    if (!artistId || !title || !description) {
        throw new ApiError(400, "artistId, title, and description are required");
    }
    if (req.user.role !== 'client') {
        throw new ApiError(403, "Only clients can place orders");
    }
    if (req.user._id.toString() === artistId) {
        throw new ApiError(400, "You cannot order from yourself");
    }

    let orderData = {
        artistId,
        clientId: req.user._id,
        title,
        description,
        deadline,
        orderType: orderType || 'custom',
        statusHistory: [{ status: 'pending', updatedBy: req.user._id }]
    };

    if (orderType === 'direct') {
        if (!portfolioItemId) {
            throw new ApiError(400, "portfolioItemId is required for direct orders");
        }
        const artwork = await PortfolioItem.findById(portfolioItemId);
        if (!artwork) throw new ApiError(404, "Artwork not found");
        if (!artwork.isAvailable) throw new ApiError(400, "This artwork is no longer available for purchase");
        if (artwork.artistId.toString() !== artistId) {
            throw new ApiError(400, "Artwork does not belong to this artist");
        }

        // Optimistic lock: mark unavailable before creating order
        artwork.isAvailable = false;
        await artwork.save();

        orderData.portfolioItemId = portfolioItemId;
        orderData.price = artwork.price;
        orderData.status = 'accepted'; // Direct purchase skips pending/quote steps
        orderData.priceConfirmed = true;
        orderData.statusHistory = [{ status: 'accepted', updatedBy: req.user._id }];
    } else {
        orderData.status = 'pending';
        if (referenceFiles && Array.isArray(referenceFiles)) {
            orderData.referenceFiles = referenceFiles;
        }
    }

    const order = await CommissionOrder.create(orderData);

    // Notify artist
    const artist = await User.findById(artistId);
    if (artist) {
        emailService.notifyArtistOnRequest(artist.email, req.user.email, title);
        await createInternalNotification({
            recipient: artistId,
            sender: req.user._id,
            type: "NEW_ORDER",
            message: `New ${orderType === 'direct' ? 'direct purchase' : 'commission request'}: "${title}"`,
            link: `/orders/${order._id}`
        });
    }

    return res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
});

// ─── Get Orders ───────────────────────────────────────────────────────────────

const getOrders = asyncHandler(async (req, res) => {
    const { status, orderType } = req.query;
    let query = {};

    if (req.user.role === 'artist') {
        query.artistId = req.user._id;
    } else if (req.user.role === 'client') {
        query.clientId = req.user._id;
    }
    // admin sees all

    if (status) query.status = status;
    if (orderType) query.orderType = orderType;

    const orders = await CommissionOrder.find(query)
        .populate("clientId", "email fullName username profileImage")
        .populate("artistId", "email fullName username profileImage")
        .populate("portfolioItemId", "title mediaUrl price")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// ─── Get Order By ID ──────────────────────────────────────────────────────────

const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await CommissionOrder.findById(id)
        .populate("clientId", "email fullName username profileImage")
        .populate("artistId", "email fullName username profileImage")
        .populate("portfolioItemId", "title mediaUrl price");

    if (!order) throw new ApiError(404, "Order not found");

    const isParticipant =
        order.artistId._id.toString() === req.user._id.toString() ||
        order.clientId._id.toString() === req.user._id.toString() ||
        req.user.role === 'admin';

    if (!isParticipant) throw new ApiError(403, "Not authorized to view this order");

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

// ─── Update Order Status ──────────────────────────────────────────────────────

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, deliverableFiles, note } = req.body;

    const order = await CommissionOrder.findById(id)
        .populate("clientId", "email fullName")
        .populate("artistId", "email fullName");

    if (!order) throw new ApiError(404, "Order not found");

    const isArtist = order.artistId._id.toString() === req.user._id.toString();
    const isClient = order.clientId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isArtist && !isClient && !isAdmin) {
        throw new ApiError(403, "Not authorized to update this order");
    }

    // Role-based constraints
    if (isClient) {
        const clientAllowed = ['cancelled', 'accepted']; // accepted = confirming price_quoted
        if (!clientAllowed.includes(status)) {
            throw new ApiError(403, "Clients can only cancel orders or confirm quoted prices");
        }
        if (status === 'cancelled' && !['pending', 'price_quoted', 'awaiting_price'].includes(order.status)) {
            throw new ApiError(400, "You can only cancel orders that haven't started yet");
        }
        if (status === 'accepted' && order.status !== 'price_quoted') {
            throw new ApiError(400, "You can only confirm a price that has been quoted");
        }
    }

    if (isArtist && status === 'cancelled') {
        throw new ApiError(403, "Artists cannot cancel — use 'rejected' instead");
    }

    if (!isAdmin && !VALID_TRANSITIONS[order.status]?.includes(status)) {
        throw new ApiError(400, `Cannot transition from '${order.status}' to '${status}'`);
    }

    order.status = status;
    order.statusHistory.push({ status, updatedBy: req.user._id, note, timestamp: new Date() });

    if (status === 'accepted' && order.status === 'price_quoted') {
        order.priceConfirmed = true;
    }

    if (deliverableFiles && Array.isArray(deliverableFiles)) {
        order.deliverableFiles = deliverableFiles;
    }

    await order.save();

    // Notify the other party
    const recipientId = isArtist ? order.clientId._id : order.artistId._id;
    await createInternalNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: "ORDER_UPDATE",
        message: `Order "${order.title}" status → ${status}`,
        link: `/orders/${id}`
    });

    if (isArtist || isAdmin) {
        emailService.notifyClientOnStatusChange(order.clientId.email, order.title, status);
    }

    return res.status(200).json(new ApiResponse(200, order, "Order updated successfully"));
});

// ─── Artist Sets Price (Custom Orders) ────────────────────────────────────────

const setPriceByArtist = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || isNaN(price) || price <= 0) {
        throw new ApiError(400, "A valid positive price is required");
    }

    const order = await CommissionOrder.findById(id)
        .populate("clientId", "email fullName")
        .populate("artistId", "email fullName");

    if (!order) throw new ApiError(404, "Order not found");
    if (order.artistId._id.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the artist can set the price");
    }
    if (order.orderType !== 'custom') {
        throw new ApiError(400, "Prices are set automatically for direct orders");
    }
    if (!['pending', 'awaiting_price'].includes(order.status)) {
        throw new ApiError(400, "Price can only be set on pending or awaiting-price orders");
    }

    order.price = price;
    order.status = 'price_quoted';
    order.statusHistory.push({
        status: 'price_quoted',
        updatedBy: req.user._id,
        note: `Artist quoted price: ₹${price}`,
        timestamp: new Date()
    });
    await order.save();

    // Notify client
    await createInternalNotification({
        recipient: order.clientId._id,
        sender: req.user._id,
        type: "PRICE_QUOTED",
        message: `Artist quoted ₹${price} for "${order.title}". Please review and confirm.`,
        link: `/orders/${id}`
    });

    emailService.notifyClientOnStatusChange(order.clientId.email, order.title, 'price_quoted');

    return res.status(200).json(new ApiResponse(200, order, "Price set. Waiting for client confirmation."));
});

export {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    setPriceByArtist
};
