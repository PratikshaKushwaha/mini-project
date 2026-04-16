import { User } from "../models/user.model.js";
import { ArtistProfile } from "../models/artistProfile.model.js";
import { CommissionOrder } from "../models/commissionOrder.model.js";
import { AdminLog } from "../models/adminLog.model.js";
import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getSystemStats = asyncHandler(async (req, res) => {
    const [userCount, artistCount, orderCount, categoryCount, revenue] = await Promise.all([
        User.countDocuments(),
        ArtistProfile.countDocuments(),
        CommissionOrder.countDocuments(),
        Category.countDocuments(),
        CommissionOrder.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ])
    ]);

    const stats = {
        users: userCount,
        artists: artistCount,
        orders: orderCount,
        totalCategories: categoryCount,
        revenue: revenue[0]?.total || 0,
        recentOrders: await CommissionOrder.find().sort({ createdAt: -1 }).limit(5).populate("clientId artistId", "username")
    };

    return res.status(200).json(new ApiResponse(200, stats, "System stats fetched"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
        query.$or = [
            { fullName: new RegExp(search, "i") },
            { username: new RegExp(search, "i") },
            { email: new RegExp(search, "i") }
        ];
    }
    if (role) query.role = role;

    const users = await User.find(query)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalUsers: total
    }, "Users list fetched"));
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params; // comes from route: /admin/users/:userId/role
    const { role } = req.body;
    
    if (!["client", "artist", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role specified");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log admin action
    await AdminLog.create({
        adminId: req.user._id,
        action: "UPDATE_USER_ROLE",
        targetId: userId,
        details: `Changed role of ${user.username} from ${oldRole} to ${role}`
    });

    return res.status(200).json(new ApiResponse(200, user, "User role updated successfully"));
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    // Safety: never allow deleting admin accounts through this endpoint
    if (user.role === "admin") {
        throw new ApiError(403, "Admin accounts cannot be deleted through this interface.");
    }

    // Cascade: remove artist profile if applicable
    if (user.role === "artist") {
        await ArtistProfile.findOneAndDelete({ userId });
    }

    await User.findByIdAndDelete(userId);

    // Log admin action
    await AdminLog.create({
        adminId: req.user._id,
        action: "DELETE_USER",
        targetId: userId,
        details: `Deleted user ${user.username} (${user.email}) with role ${user.role}`
    });

    return res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});
