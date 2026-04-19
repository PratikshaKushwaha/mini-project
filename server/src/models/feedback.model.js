import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema(
    {
        portfolioItemId: {
            type: Schema.Types.ObjectId,
            ref: "PortfolioItem",
            required: true,
            index: true
        },
        artistId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        /** Optional: link to the completed order that unlocks feedback */
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "CommissionOrder",
            default: null
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    { timestamps: true }
);

/** One feedback per client per artwork */
feedbackSchema.index({ portfolioItemId: 1, clientId: 1 }, { unique: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
