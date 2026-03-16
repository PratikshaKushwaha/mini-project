import mongoose, { Schema } from "mongoose";

const disputeSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "CommissionOrder",
            required: true,
            index: true
        },
        raisedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        explanation: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Open", "Under Review", "Resolved", "Cancelled"],
            default: "Open"
        },
        resolution: {
            type: String // Admin notes on how it was resolved
        },
        resolvedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

export const Dispute = mongoose.model("Dispute", disputeSchema);
