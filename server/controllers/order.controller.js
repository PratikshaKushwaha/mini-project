import { CommissionOrder } from "../models/commissionOrder.model.js";
import { CommissionService } from "../models/commissionService.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createInternalNotification } from "./notification.controller.js";

const createOrder = asyncHandler(async (req, res) => {
    const { artistId, serviceId, requirements, referenceFiles, deadline } = req.body;

    if (!artistId || !serviceId || !requirements) {
        throw new ApiError(400, "Required fields are missing");
    }

    const service = await CommissionService.findById(serviceId);
    if (!service) {
        throw new ApiError(404, "Service not found");
    }

    if (req.user.role !== 'client') {
        throw new ApiError(403, "Only clients can request orders");
    }

    const order = await CommissionOrder.create({
        artistId,
        clientId: req.user._id,
        serviceId,
        requirements,
        referenceFiles,
        deadline
    });

    return res.status(201).json(new ApiResponse(201, order, "Order requested successfully"));
});

const getOrders = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'artist') {
        query.artistId = req.user._id;
    } else if (req.user.role === 'client') {
        query.clientId = req.user._id;
    } else if (req.user.role === 'admin') {
        // Admin sees all
    }

    const orders = await CommissionOrder.find(query)
        .populate("clientId", "email fullName")
        .populate("serviceId", "title basePrice")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await CommissionOrder.findById(id)
        .populate("clientId", "email")
        .populate("artistId", "email")
        .populate("serviceId", "title basePrice deliveryTime");

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
    const { status, deliverableFiles } = req.body; // Requested, Accepted, Rejected, In Progress, Ready for Delivery, Delivered, Revision Requested, Completed, Cancelled

    const validTransitions = {
        'Requested': ['Accepted', 'Rejected', 'Cancelled'],
        'Accepted': ['In Progress', 'Cancelled'],
        'In Progress': ['Ready for Delivery', 'Cancelled'],
        'Ready for Delivery': ['Delivered', 'Cancelled'],
        'Delivered': ['Completed', 'Revision Requested', 'Cancelled'],
        'Revision Requested': ['Delivered', 'Cancelled'],
        'Cancelled': [],
        'Rejected': [],
        'Completed': []
    };

    const order = await CommissionOrder.findById(id);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.artistId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'client') {
        throw new ApiError(403, "Not authorized to update this order");
    }

    // Role-based status constraints
    if (req.user.role === 'client' && !['Completed', 'Cancelled', 'Revision Requested'].includes(status)) {
         throw new ApiError(403, "Clients can only Complete, Cancel, or Request Revisions");
    }

    if (!validTransitions[order.status]?.includes(status) && req.user.role !== 'admin') {
        throw new ApiError(400, `Cannot transition from ${order.status} to ${status}`);
    }

    order.status = status;
    
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

    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

export {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
};
