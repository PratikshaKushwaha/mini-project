import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        refreshTokenHash: {
            type: String,
            required: true,
            index: true
        },
        ip: {
            type: String
        },
        userAgent: {
            type: String
        },
        revoked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
