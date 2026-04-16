import mongoose, { Schema } from "mongoose";

const adminLogSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: {
            type: String,
            required: true,
            trim: true
        },
        details: {
            type: Schema.Types.Mixed
        }
    },
    { timestamps: true }
);

export const AdminLog = mongoose.model("AdminLog", adminLogSchema);
