import passport from "passport";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(
        new ApiError(
          500,
          err?.message || "Internal Server Error during authentication",
        ),
      );
    }
    if (!user) {
      let message = "Authentication failed: Invalid or expired token";
      if (info?.name === "TokenExpiredError") {
        message = "Token expired. Please login again.";
      } else if (info?.message === "No auth token") {
        message = "Access denied: No token provided";
      } else if (info?.message) {
        message = info.message;
      }
      return next(new ApiError(401, message));
    }

    req.user = user;
    next();
  })(req, res, next);
};

export const verifyRole = (roles) => {
  // Normalize: accept string or array
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, _, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return next(
        new ApiError(403, "Forbidden: You do not have the required role"),
      );
    }
    next();
  };
};
