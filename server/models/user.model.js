import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
        // For Google OAuth new-user flow
        hasCompletedProfile: {
            type: Boolean,
            default: true // false only for Google OAuth pending-setup users
        },
        googleEmail: {
            type: String,
            lowercase: true,
            trim: true
        },
        // Password reset
        resetPasswordOtp: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        }
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

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

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model("User", userSchema);
