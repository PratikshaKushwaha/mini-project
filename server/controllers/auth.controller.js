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
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { emailService } from "../utils/email.service.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateAccessAndRefreshTokens = async (userId, req) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const refreshToken = user.generateRefreshToken();
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await Session.create({
        userId: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });

    const accessToken = user.generateAccessToken(session._id);
    return { accessToken, refreshToken, sessionId: session._id };
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 24 * 60 * 60 * 1000
};

// ─── Register ────────────────────────────────────────────────────────────────

const registerUser = asyncHandler(async (req, res) => {
    const { email, password, role, username, fullName } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    if (!username) {
        throw new ApiError(400, "Username is required");
    }
    // Validate username format
    if (!/^[a-z0-9_]{3,20}$/.test(username.toLowerCase())) {
        throw new ApiError(400, "Username must be 3-20 characters: lowercase letters, numbers, underscores only");
    }

    const existedUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
    });

    if (existedUser) {
        if (existedUser.email === email.toLowerCase()) {
            throw new ApiError(409, "An account with this email already exists");
        }
        throw new ApiError(409, "This username is already taken");
    }

    // Admin role is only assigned via env config, not by user self-declaration
    const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase());

    const isAdmin = adminEmails.includes(email.toLowerCase());
    const userRole = isAdmin ? 'admin' : (role === 'artist' ? 'artist' : 'client');

    const user = await User.create({
        email: email.toLowerCase(),
        password,
        role: userRole,
        isSuperAdmin: isAdmin,
        username: username.toLowerCase(),
        fullName,
        hasCompletedProfile: true
    });

    if (user.role === 'artist') {
        await ArtistProfile.create({ artistId: user._id });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, req);
    const createdUser = await User.findById(user._id).select("-password -resetPasswordOtp");

    emailService.notifyWelcomeEmail(user.email, user.fullName || user.username);

    return res.status(201)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(201, {
            user: createdUser,
            accessToken
        }, "User registered successfully"));
});

// ─── Login (email OR username) ───────────────────────────────────────────────

const loginUser = asyncHandler(async (req, res) => {
    // Accept 'identifier' (email or username) or legacy 'email' field
    const { identifier, email, password } = req.body;
    const loginId = (identifier || email || "").trim().toLowerCase();

    if (!loginId || !password) {
        throw new ApiError(400, "Email/username and password are required");
    }

    // Try email first, then username
    const user = await User.findOne({
        $or: [{ email: loginId }, { username: loginId }]
    });

    if (!user) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!user.hasCompletedProfile) {
        throw new ApiError(403, "Please complete your profile setup first");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, req);
    const loggedInUser = await User.findById(user._id).select("-password -resetPasswordOtp");

    return res.status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Logged in successfully"));
});

// ─── Google OAuth ─────────────────────────────────────────────────────────────

const googleAuth = asyncHandler(async (req, res) => {
    const { token, role } = req.body;

    if (!token) throw new ApiError(400, "Google token is required");

    let googleEmail;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        googleEmail = ticket.getPayload().email;
    } catch (err) {
        throw new ApiError(401, "Invalid Google token");
    }

    // Check if user already exists and has completed profile setup 
    const existingUser = await User.findOne({ email: googleEmail.toLowerCase() });

    if (existingUser && existingUser.hasCompletedProfile) {
        // Returning Google user — issue tokens directly
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existingUser._id, req);
        const loggedInUser = await User.findById(existingUser._id).select("-password -resetPasswordOtp");

        return res.status(200)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "Google login successful"));
    }

    if (existingUser && !existingUser.hasCompletedProfile) {
        // User started OAuth but didn't finish — prompt again
        return res.status(200).json(new ApiResponse(200, {
            requiresProfile: true,
            googleEmail
        }, "Profile setup required"));
    }

    // Brand new Google user — they must create username + password before getting a session
    return res.status(200).json(new ApiResponse(200, {
        requiresProfile: true,
        googleEmail,
        suggestedRole: role || 'client'
    }, "Profile setup required to complete registration"));
});

// ─── Complete Profile (Google OAuth new users) ────────────────────────────────

const completeGoogleProfile = asyncHandler(async (req, res) => {
    const { googleEmail, username, password, fullName, role } = req.body;

    if (!googleEmail || !username || !password) {
        throw new ApiError(400, "Google email, username, and password are required");
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username.toLowerCase())) {
        throw new ApiError(400, "Username must be 3-20 characters: letters, numbers, underscores only");
    }
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters");
    }

    // Ensure the googleEmail hasn't been taken in between
    const existingUser = await User.findOne({ email: googleEmail.toLowerCase() });
    if (existingUser && existingUser.hasCompletedProfile) {
        throw new ApiError(409, "Account already exists. Please log in.");
    }

    // Check username uniqueness
    const usernameConflict = await User.findOne({ username: username.toLowerCase() });
    if (usernameConflict) {
        throw new ApiError(409, "Username is already taken");
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map(e => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(googleEmail.toLowerCase());
    const userRole = isAdmin ? 'admin' : (role === 'artist' ? 'artist' : 'client');

    let user;
    if (existingUser) {
        // Update the incomplete record
        existingUser.username = username.toLowerCase();
        existingUser.password = password;
        existingUser.fullName = fullName || existingUser.fullName;
        existingUser.hasCompletedProfile = true;
        existingUser.role = userRole;
        await existingUser.save();
        user = existingUser;
    } else {
        user = await User.create({
            email: googleEmail.toLowerCase(),
            password,
            username: username.toLowerCase(),
            fullName,
            role: userRole,
            isSuperAdmin: isAdmin,
            hasCompletedProfile: true,
            googleEmail: googleEmail.toLowerCase()
        });
    }

    if (user.role === 'artist') {
        const existingProfile = await ArtistProfile.findOne({ artistId: user._id });
        if (!existingProfile) {
            await ArtistProfile.create({ artistId: user._id });
        }
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, req);
    const createdUser = await User.findById(user._id).select("-password -resetPasswordOtp");

    emailService.notifyWelcomeEmail(user.email, user.fullName || user.username);

    return res.status(201)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(201, { user: createdUser, accessToken }, "Profile completed. Welcome!"));
});

// ─── Refresh Token ────────────────────────────────────────────────────────────

const refreshToken = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!oldRefreshToken) {
        return res.status(200).json(new ApiResponse(200, { accessToken: null }, "No active session"));
    }

    try {
        const decodedToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const refreshTokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');

        const session = await Session.findOne({ refreshTokenHash, revoked: false });
        if (!session) throw new ApiError(401, "Session not found or revoked");

        const user = await User.findById(decodedToken._id);
        if (!user) throw new ApiError(401, "User not found");

        const newRefreshToken = user.generateRefreshToken();
        const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

        session.refreshTokenHash = newRefreshTokenHash;
        session.ip = req.ip;
        session.userAgent = req.headers['user-agent'];
        await session.save();

        const accessToken = user.generateAccessToken(session._id);

        return res.status(200)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(new ApiResponse(200, { accessToken }, "Token refreshed"));

    } catch (error) {
        return res.status(200).json(new ApiResponse(200, { accessToken: null }, "Invalid or expired session"));
    }
});

// ─── Logout ───────────────────────────────────────────────────────────────────

const logout = asyncHandler(async (req, res) => {
    const oldRefreshToken = req.cookies.refreshToken;
    if (oldRefreshToken) {
        const hash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');
        await Session.findOneAndUpdate({ refreshTokenHash: hash }, { revoked: true });
    }
    res.clearCookie("refreshToken", cookieOptions);
    return res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

const logoutAll = asyncHandler(async (req, res) => {
    await Session.updateMany({ userId: req.user._id }, { revoked: true });
    res.clearCookie("refreshToken", cookieOptions);
    return res.status(200).json(new ApiResponse(200, {}, "Logged out of all sessions"));
});

// ─── Get Current User ─────────────────────────────────────────────────────────

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

// ─── Update Profile ───────────────────────────────────────────────────────────

const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, username, dob } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    if (fullName !== undefined) user.fullName = fullName;

    if (username !== undefined) {
        const cleanUsername = username.toLowerCase();
        if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
            throw new ApiError(400, "Invalid username format");
        }
        // Check uniqueness (excluding self)
        const conflict = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
        if (conflict) throw new ApiError(409, "Username already taken");
        user.username = cleanUsername;
    }

    if (dob !== undefined) user.dob = dob;

    if (req.files) {
        if (req.files.profileImage?.[0]) {
            const upload = await uploadOnCloudinary(req.files.profileImage[0].buffer);
            if (upload) user.profileImage = upload.url;
        }
        if (req.files.bannerImage?.[0]) {
            const upload = await uploadOnCloudinary(req.files.bannerImage[0].buffer);
            if (upload) user.bannerImage = upload.url;
        }
    }

    await user.save({ validateBeforeSave: false });
    const updatedUser = await User.findById(user._id).select("-password -resetPasswordOtp");

    return res.status(200).json(new ApiResponse(200, updatedUser, "Profile updated successfully"));
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email is required");

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return same message to prevent user enumeration
    if (!user) {
        return res.status(200).json(new ApiResponse(200, null, "If the email is registered, an OTP will be sent."));
    }

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false
    });

    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail(
            email,
            "Your Password Reset OTP — ArtisanConnect",
            null,
            `
            <div style="font-family:'Inter',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fdfaf7;border-radius:24px;overflow:hidden;border:1px solid #e5e0dc;">
                <div style="background:#3d3028;padding:40px;text-align:center;color:#fff;">
                    <h1 style="margin:0;font-size:24px;">Password Reset</h1>
                </div>
                <div style="padding:40px;color:#3d3028;line-height:1.6;text-align:center;">
                    <p style="font-size:16px;color:#665a52;">Your OTP for password reset:</p>
                    <div style="font-size:36px;font-weight:bold;background:#e5e0dc;color:#3d3028;padding:20px;border-radius:16px;display:inline-block;margin:20px 0;letter-spacing:8px;">${otp}</div>
                    <p style="font-size:14px;color:#8c7e74;">Valid for 15 minutes. Do not share this code.</p>
                </div>
            </div>
            `
        );
    } catch (err) {
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "Failed to send OTP email. Please try again.");
    }

    return res.status(200).json(new ApiResponse(200, { email }, "OTP sent to your email"));
});

// ─── Verify OTP ───────────────────────────────────────────────────────────────

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) throw new ApiError(400, "Email and OTP are required");

    const user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Invalid or expired OTP");

    return res.status(200).json(new ApiResponse(200, null, "OTP verified successfully"));
});

// ─── Reset Password ───────────────────────────────────────────────────────────

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) throw new ApiError(400, "All fields are required");
    if (newPassword.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

    const user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordOtp: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Invalid or expired OTP");

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully. Please login."));
});

export {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    googleAuth,
    completeGoogleProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    logout,
    logoutAll,
    refreshToken
};
