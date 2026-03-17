import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createInternalNotification } from "./notification.controller.js";
import { emailService } from "../utils/email.service.js";
import { User } from "../models/user.model.js";

const createOrder = asyncHandler(async (req, res) => {
    const { artistId, title, description, referenceFiles, deadline } = req.body;

    if (!artistId || !title || !description) {
        throw new ApiError(400, "Required fields are missing");
    }

    if (req.user.role !== 'client') {
        throw new ApiError(403, "Only clients can request orders");
    }

    const order = await CommissionOrder.create({
        artistId,
        clientId: req.user._id,
        title,
        description,
        referenceFiles,
        deadline,
        status: 'pending',
        statusHistory: [{ status: 'pending', updatedBy: req.user._id }]
    });

    // Notify artist
    const artist = await User.findById(artistId);
    if (artist) {
        emailService.notifyArtistOnRequest(artist.email, req.user.email, title);
    }

    return res.status(201).json(new ApiResponse(201, order, "Order requested successfully"));
});

const getOrders = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'artist') {
        query.artistId = req.user._id;
    } else if (req.user.role === 'client') {
        query.clientId = req.user._id;
    }

    const orders = await CommissionOrder.find(query)
        .populate("clientId", "email fullName")
        .populate("artistId", "email fullName")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await CommissionOrder.findById(id)
        .populate("clientId", "email fullName")
        .populate("artistId", "email fullName");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check participation
    if (order.artistId._id.toString() !== req.user._id.toString() &&
        order.clientId._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
        throw new ApiError(403, "Not authorized to view this order");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, deliverableFiles } = req.body; 

    const validTransitions = {
        'pending': ['accepted', 'rejected', 'cancelled'],
        'accepted': ['in_progress'],
        'in_progress': ['completed'],
        'rejected': [],
        'completed': [],
        'cancelled': []
    };

    const order = await CommissionOrder.findById(id).populate("clientId", "email").populate("artistId", "email");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const isArtist = order.artistId.toString() === req.user._id.toString();
    const isClient = order.clientId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isArtist && !isClient && !isAdmin) {
        throw new ApiError(403, "Not authorized to update this order");
    }

    // Role-based status constraints
    if (isClient && status !== 'cancelled') {
        throw new ApiError(403, "Clients can only cancel requests");
    }

    if (isClient && status === 'cancelled' && order.status !== 'pending') {
        throw new ApiError(400, "Clients can only cancel pending requests");
    }

    if (isArtist && ['cancelled'].includes(status)) {
         throw new ApiError(403, "Artists cannot cancel requests, they can only reject");
    }

    if (!validTransitions[order.status]?.includes(status) && !isAdmin) {
        throw new ApiError(400, `Cannot transition from ${order.status} to ${status}`);
    }

    order.status = status;
    order.statusHistory.push({
        status,
        updatedBy: req.user._id,
        timestamp: new Date()
    });
    
    if (deliverableFiles) {
        order.deliverableFiles = deliverableFiles;
    }
    
    await order.save();

    // Dispatch Notification
    const recipientId = req.user.role === 'artist' ? order.clientId : order.artistId;
    
    await createInternalNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: "ORDER_UPDATE",
        message: `Order status updated to: ${status}`,
        link: `/orders/${id}`
    });

    // Send email notification
    if (isArtist || isAdmin) {
        emailService.notifyClientOnStatusChange(order.clientId.email, order.title, status);
    } else if (isClient && status === 'cancelled') {
        emailService.notifyClientOnStatusChange(order.artistId.email, order.title, status); // Optionally notify artist of cancellation
    }

    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

export {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
};
