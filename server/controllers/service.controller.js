import { CommissionService } from "../models/commissionService.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createService = asyncHandler(async (req, res) => {
    const { title, description, basePrice, deliveryTime, serviceType } = req.body;

    if (!title || !basePrice || !deliveryTime || !serviceType) {
        throw new ApiError(400, "Required fields are missing");
    }

    if (req.user.role !== 'artist') {
        throw new ApiError(403, "Only artists can create services");
    }

    const service = await CommissionService.create({
        artistId: req.user._id,
        title,
        description,
        basePrice,
        deliveryTime,
        serviceType
    });

    return res.status(201).json(new ApiResponse(201, service, "Service created successfully"));
});

const getArtistServices = asyncHandler(async (req, res) => {
    const { artistId } = req.params;

    const services = await CommissionService.find({ artistId, isActive: true });

    return res.status(200).json(new ApiResponse(200, services, "Artist services fetched successfully"));
});

export {
    createService,
    getArtistServices
};
