import mongoose, { Schema } from "mongoose";

const portfolioItemSchema = new Schema(
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
        mediaUrl: {
            type: String,
            required: true // Cloudinary URL
        },
        price: {
            type: Number,
            default: null
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category"
        }
    },
    { timestamps: true }
);

export const PortfolioItem = mongoose.model("PortfolioItem", portfolioItemSchema);
