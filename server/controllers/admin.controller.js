import { User } from "../models/user.model.js";
import { ArtistProfile } from "../models/artistProfile.model.js";
import { PortfolioItem } from "../models/portfolioItem.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { Message } from "../models/message.model.js";
import { Review } from "../models/review.model.js";
import { Feedback } from "../models/feedback.model.js";
import { Session } from "../models/session.model.js";
import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getSystemStats = asyncHandler(async (req, res) => {
    const [totalUsers, countArtists, countClients, totalOrders, completedOrders, totalCategories] =
        await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'artist' }),
            User.countDocuments({ role: 'client' }),
            CommissionOrder.countDocuments(),
            CommissionOrder.countDocuments({ status: 'completed' }),
            Category.countDocuments()
        ]);

    return res.status(200).json(new ApiResponse(200, {
        totalUsers,
        artists: countArtists,
        clients: countClients,
        totalOrders,
        completedOrders,
        totalCategories
    }, "Stats fetched"));
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['artist', 'client', 'admin'].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }
    if (!req.user.isSuperAdmin) {
        throw new ApiError(403, "Only the primary admin can manage roles");
    }

    const targetUser = await User.findById(id);
    if (!targetUser) throw new ApiError(404, "User not found");
    if (targetUser.isSuperAdmin) throw new ApiError(403, "Cannot modify the primary admin");

    // If promoting to artist and no profile exists, create one
    if (role === 'artist') {
        const existingProfile = await ArtistProfile.findOne({ artistId: id });
        if (!existingProfile) {
            await ArtistProfile.create({ artistId: id });
        }
    }

    targetUser.role = role;
    await targetUser.save();

    return res.status(200).json(new ApiResponse(200, targetUser, "User role updated"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    const { search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ email: regex }, { username: regex }, { fullName: regex }];
    }

    const users = await User.find(query).select("-password -resetPasswordOtp").sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, users, "Users fetched"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const targetUser = await User.findById(id);
    if (!targetUser) throw new ApiError(404, "User not found");
    if (targetUser.isSuperAdmin) throw new ApiError(403, "Cannot delete the primary admin");
    if (targetUser.role === 'admin' && !req.user.isSuperAdmin) {
        throw new ApiError(403, "Only the primary admin can delete other admins");
    }

    // Cascade delete — clean up all related data
    const artistPortfolioItems = await PortfolioItem.find({ artistId: id }).select('_id');
    const portfolioIds = artistPortfolioItems.map(p => p._id);

    await Promise.all([
        ArtistProfile.deleteOne({ artistId: id }),
        PortfolioItem.deleteMany({ artistId: id }),
        CommissionOrder.deleteMany({ $or: [{ artistId: id }, { clientId: id }] }),
        Message.deleteMany({ senderId: id }),
        Review.deleteMany({ $or: [{ artistId: id }, { clientId: id }] }),
        Feedback.deleteMany({ $or: [{ artistId: id }, { clientId: id }] }),
        Session.deleteMany({ userId: id }),
        User.findByIdAndDelete(id)
    ]);

    return res.status(200).json(new ApiResponse(200, {}, "User and all related data deleted"));
});

export { getSystemStats, getAllUsers, deleteUser, updateUserRole };
