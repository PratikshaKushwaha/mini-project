import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @typedef {Object} User
 * @property {string} email - Unique, lowercase email address. Primary identifier.
 * @property {string} username - Unique, lowercase alphanumeric identifier for URLs.
 * @property {string} password - Bcrypt-hashed credential.
 * @property {('artist'|'client'|'admin')} role - Access level designated for the user.
 * @property {boolean} hasCompletedProfile - Flag for Google OAuth lifecycle management.
 */

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            trim: true
        },
        username: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
            lowercase: true,
            match: [/^[a-z0-9_]{3,20}$/, "Username must be 3-20 chars: letters, numbers, underscores only"]
        },
        dob: {
            type: Date
        },
        profileImage: {
            type: String // Cloudinary URL
        },
        bannerImage: {
            type: String // Cloudinary URL
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        role: {
            type: String,
            enum: ['artist', 'client', 'admin'],
            default: 'client'
        },
        isSuperAdmin: {
            type: Boolean,
            default: false
        },
        hasCompletedProfile: {
            type: Boolean,
            default: true
        },
        googleEmail: {
            type: String,
            lowercase: true,
            trim: true
        },
        resetPasswordOtp: {
            type: String
        },
        resetPasswordOtpExpiry: {
            type: Date
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
);

/**
 * @description Pre-save hook to hash passwords before database ingestion.
 * Ensures the plaintext password never touches the storage layer.
 */
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/**
 * @description Validates a plaintext password against the stored hash.
 * @param {string} password - The login credential provided by the user.
 * @returns {Promise<boolean>} Match validity.
 */
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

/**
 * @description Issues a short-lived Access Token for stateless authentication.
 * @param {string} [sessionId] - Optional session tracker for multi-device auditing.
 * @returns {string} JWT Access Token.
 */
userSchema.methods.generateAccessToken = function (sessionId) {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
            sessionId: sessionId
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * @description Issues a long-lived Refresh Token for session persistence.
 * @returns {string} JWT Refresh Token.
 */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model("User", userSchema);
