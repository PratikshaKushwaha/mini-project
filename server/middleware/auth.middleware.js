import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // 1. Extract token safely
    const authHeader = req.headers.authorization;
    const token =
        req.cookies?.accessToken ||
        (authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null);

    if (!token) {
        throw new ApiError(401, "No token provided");
    }

    let decodedToken;

    // 2. Verify token
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired");
        }
        throw new ApiError(401, "Invalid token");
    }

    // 3. Fetch user
    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    // 4. Session validation (safe)
    if (decodedToken.sessionId) {
        try {
            const session = await Session.findById(decodedToken.sessionId);

            if (!session || session.revoked) {
                throw new ApiError(401, "Session invalid or revoked");
            }
        } catch (err) {
            console.error("Session check failed:", err.message);
            throw new ApiError(401, "Session validation failed");
        }
    }

    // 5. Attach user
    req.user = user;
    next();
});

export const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            throw new ApiError(403, "Forbidden: You do not have the required role to perform this action");
        }
        next();
    };
};
