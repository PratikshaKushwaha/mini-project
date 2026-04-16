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
        imageUrl: {
            type: String,
            required: true // Cloudinary URL
        },
        price: {
            type: Number,
            default: null
        },
        isAvailable: {
            type: Boolean,
            default: true // Artwork is available for direct purchase
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            index: true
        }
    },
    { timestamps: true }
);

// Full-text search on artwork title and description
portfolioItemSchema.index({ title: "text", description: "text" });

export const PortfolioItem = mongoose.model("PortfolioItem", portfolioItemSchema);
