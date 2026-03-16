import mongoose, { Schema } from "mongoose";

const commissionServiceSchema = new Schema(
    {
        artistId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        deliveryTime: {
            type: String, // e.g., "7 days", "2 weeks"
            required: true
        },
        serviceType: {
            type: String,
            enum: ['service', 'product'],
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const CommissionService = mongoose.model("CommissionService", commissionServiceSchema);
