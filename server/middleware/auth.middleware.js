import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Verify session
        if (decodedToken.sessionId) {
            const session = await Session.findById(decodedToken.sessionId);
            if (!session || session.revoked) {
                throw new ApiError(401, "Session has been revoked or is invalid");
            }
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error instanceof ApiError) {
            throw new ApiError(401, error?.message || "Invalid access token");
        } else {
            throw new ApiError(500, "Internal Server Error fetching session: " + error?.message);
        }
    }
});

export const verifyRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role)) {
            throw new ApiError(403, "Forbidden: You do not have the required role to perform this action");
        }
        next();
    };
};
