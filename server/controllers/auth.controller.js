import { User } from "../models/user.model.js";
import { ArtistProfile } from "../models/artistProfile.model.js";
import { Session } from "../models/session.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OAuth2Client } from "google-auth-library";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import { sendEmail } from "../utils/mail.helper.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshTokens = async (userId, req) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const refreshToken = user.generateRefreshToken();
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        // Create new session
        const session = await Session.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });

        const accessToken = user.generateAccessToken(session._id);

        return { accessToken, refreshToken, sessionId: session._id };
    } catch (error) {
        console.error("Token generation error:", error);
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const isAdmin = email === process.env.GOOGLE_MAIL_USER;
    const userRole = isAdmin ? 'admin' : (role || 'client');

    const user = await User.create({
        email,
        password,
        role: userRole
    });

    if (user.role === 'artist') {
        await ArtistProfile.create({
            artistId: user._id
        });
    }

    const { accessToken, refreshToken, sessionId } = await generateAccessAndRefreshTokens(user._id, req);
    const createdUser = await User.findById(user._id).select("-password");

    return res
        .status(201)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(201, {
                user: createdUser,
                accessToken,
                sessionId
            }, "User registered Successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken, sessionId } = await generateAccessAndRefreshTokens(user._id, req);
    const loggedInUser = await User.findById(user._id).select("-password");

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    sessionId
                },
                "User logged In Successfully"
            )
        );
});

const googleAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        throw new ApiError(400, "Google token is required");
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        const isAdmin = email === process.env.GOOGLE_MAIL_USER;
        const userRole = isAdmin ? 'admin' : 'client';

        if (!user) {
            user = await User.create({
                email,
                password: googleId,
                role: userRole
            });
        }

        const { accessToken, refreshToken, sessionId } = await generateAccessAndRefreshTokens(user._id, req);
        const loggedInUser = await User.findById(user._id).select("-password");

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        sessionId
                    },
                    "Google Login Successful"
                )
            );
    } catch (error) {
        throw new ApiError(401, "Invalid Google Token");
    }
});

const refreshToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
        throw new ApiError(401, "Refresh token is missing");
    }

    try {
        const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const refreshTokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');

        const session = await Session.findOne({
            refreshTokenHash,
            revoked: false
        });

        if (!session) {
            throw new ApiError(401, "Session not found or revoked");
        }

        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(401, "User not found");
        }

        // Token Rotation: Generate new tokens and update session
        const newRefreshToken = user.generateRefreshToken();
        const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

        session.refreshTokenHash = newRefreshTokenHash;
        session.ip = req.ip;
        session.userAgent = req.headers['user-agent'];
        await session.save();

        const accessToken = user.generateAccessToken(session._id);

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(200, { accessToken }, "Token refreshed successfully")
            );
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }
});

const logout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await Session.findOneAndUpdate({ refreshTokenHash }, { revoked: true });
    }

    res.clearCookie("refreshToken", cookieOptions);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const logoutAll = asyncHandler(async (req, res) => {
    await Session.updateMany({ userId: req.user._id }, { revoked: true });
    res.clearCookie("refreshToken", cookieOptions);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Logged out of all sessions successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(200).json(new ApiResponse(200, null, "If the email is registered, an OTP will be sent."));
    }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    // Send Email via mail helper
    try {
        await sendEmail(
            email,
            "Your Password Reset OTP",
            `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
            `
                <div style="font-family: sans-serif; padding: 20px; color: #3d3028;">
                    <h2 style="color: #3d3028;">Password Reset Request</h2>
                    <p>You requested a password reset. Use the following OTP to continue:</p>
                    <div style="font-size: 24px; font-weight: bold; background: #fdfaf7; padding: 10px; border-radius: 8px; display: inline-block; border: 1px solid #e5e0dc;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for 15 minutes.</p>
                    <p style="font-size: 12px; color: #8c7e74; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
                </div>
            `
        );
    } catch (error) {
        throw new ApiError(500, "Failed to send OTP email. Please try again later.");
    }

    return res.status(200).json(new ApiResponse(200, { email }, "OTP has been sent to your email."));
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

    const user = await User.findOne({ 
        email,
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    return res.status(200).json(new ApiResponse(200, null, "OTP Verified successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) throw new ApiError(400, "Missing required fields");

    const user = await User.findOne({ 
        email,
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully. Please login with new password."));
});

export {
    registerUser,
    loginUser,
    getCurrentUser,
    googleAuth,
    forgotPassword,
    verifyOtp,
    resetPassword,
    logout,
    logoutAll,
    refreshToken
};
