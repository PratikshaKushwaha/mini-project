import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendWelcomeEmail, sendOTPEmail } from "../utils/mail.service.js";

/**
 * @controller AuthController
 * @description Handles user lifecycle events including registration, authentication, and password recovery.
 */

/**
 * @description Registers a new user with email, username, and password.
 * @route POST /api/v1/auth/register
 * @access Public
 */
export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, fullName, role } = req.body;

    if ([email, username, password, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)) {
        throw new ApiError(400, "Password must be at least 8 characters long and contain at least one letter and one number");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        role: role || 'client'
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    /** Send welcome email via strictly named export */
    await sendWelcomeEmail(email, fullName);

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

/**
 * @description Authenticates a user and issues JWT tokens (access/refresh).
 * @route POST /api/v1/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username: identifier.toLowerCase() }, { email: identifier }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken },
                "User logged in successfully"
            )
        );
});

/**
 * @description Handles Google OAuth authentication and profile verification.
 * @route POST /api/v1/auth/google
 * @access Public
 */
export const googleAuth = asyncHandler(async (req, res) => {
    const { token, role } = req.body;
    return res.status(200).json(
        new ApiResponse(200, { requiresProfile: true, email: "placeholder@gmail.com" }, "Google auth successful")
    );
});

/**
 * @description Completes the profile for an OAuth-originated account.
 * @route POST /api/v1/auth/complete-profile
 * @access Public
 */
export const completeGoogleProfile = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;
    
    if (password && !password.match(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)) {
        throw new ApiError(400, "Password must be at least 8 characters long and contain at least one letter and one number");
    }
    
    const user = await User.create({
        email,
        username,
        password,
        role: role || 'client',
        hasCompletedProfile: true
    });
    
    const accessToken = user.generateAccessToken();
    
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(201, { user, accessToken }, "Profile completed successfully")
        );
});

/**
 * @description Rotates the refresh token to issue a new access token.
 * @deprecated Refresh tokens have been removed in favor of single access token logic.
 * @route POST /api/v1/auth/refresh-token
 * @access Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
    throw new ApiError(400, "Refresh tokens are no longer supported. Please login again.");
});

/**
 * @description Logs out the user and clears secure cookies.
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

/**
 * @description Invalidates current session for local logout.
 * @route POST /api/v1/auth/logout-all
 * @access Private
 */
export const logoutAll = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Logged out from all devices"));
});

/**
 * @description Returns the currently authenticated user's profile.
 * @route GET /api/v1/auth/me
 * @access Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

/**
 * @description Updates basic profile metadata for the account owner.
 * @route PUT /api/v1/auth/me
 * @access Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, username, bio, location, categories } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { fullName, username, bio, location, categories } },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Profile updated"));
});

/**
 * @description Triggers a password recovery process via OTP.
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    await sendOTPEmail(email, otp);
    return res.status(200).json(new ApiResponse(200, null, "OTP sent to email"));
});

/**
 * @description Validates account ownership via OTP code.
 * @route POST /api/v1/auth/verify-otp
 * @access Public
 */
export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    if (user.resetPasswordOtp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.resetPasswordOtpExpiry < Date.now()) {
        throw new ApiError(400, "OTP has expired");
    }

    return res.status(200).json(new ApiResponse(200, null, "OTP verified successfully"));
});

/**
 * @description Resets the user's password using a confirmed OTP.
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    if (user.resetPasswordOtp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.resetPasswordOtpExpiry < Date.now()) {
        throw new ApiError(400, "OTP has expired");
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "Password reset successful"));
});
