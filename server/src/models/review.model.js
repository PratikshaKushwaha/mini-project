import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        artistId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "CommissionOrder",
            required: true,
            unique: true // One review per order
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
