import { User } from "../models/user.model.js";
import { Category } from "../models/category.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @route   GET /api/v1/admin/stats
const getSystemStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const countArtists = await User.countDocuments({ role: 'artist' });
    const countClients = await User.countDocuments({ role: 'client' });
    const totalOrders = await CommissionOrder.countDocuments();
    const totalCategories = await Category.countDocuments();

    return res.status(200).json(new ApiResponse(200, {
        totalUsers,
        artists: countArtists,
        clients: countClients,
        totalOrders,
        totalCategories
    }, "Stats fetched successfully"));
});

// @route   PATCH /api/v1/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['artist', 'client', 'admin'].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    // Only Super Admin can change roles to/from admin
    if (!req.user.isSuperAdmin) {
        throw new ApiError(403, "Only the primary admin can manage other admins");
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }

    // Protect Super Admin from role changes
    if (targetUser.isSuperAdmin) {
        throw new ApiError(403, "Cannot change role of the primary admin");
    }

    targetUser.role = role;
    await targetUser.save();

    return res.status(200).json(new ApiResponse(200, targetUser, "User role updated successfully"));
});

// @route   GET /api/v1/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

// @route   DELETE /api/v1/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Prevent self-deletion if needed, or deleting other admins
    const targetUser = await User.findById(id);
    if (!targetUser) {
        throw new ApiError(404, "User not found");
    }
    if (targetUser.isSuperAdmin) {
        throw new ApiError(403, "Cannot delete the primary admin");
    }

    if (targetUser.role === 'admin' && !req.user.isSuperAdmin) {
         throw new ApiError(403, "Only the primary admin can delete other admins");
    }

    await User.findByIdAndDelete(id);
    // Ideally, also cascade delete profile, portfolio, orders...

    return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

export {
    getSystemStats,
    getAllUsers,
    deleteUser,
    updateUserRole
};
