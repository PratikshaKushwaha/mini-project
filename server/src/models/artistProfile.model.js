import mongoose, { Schema } from "mongoose";

/**
 * @typedef {Object} ArtistProfile
 * @property {ObjectId} artistId - Reference to the core User document.
 * @property {string} bio - Professional biography and artistic statement.
 * @property {string[]} categories - Specialized artistic domains (e.g., 'Digital', 'Oil').
 * @property {string} location - Geographical presence for regional searches.
 * @property {number} startingPrice - Baseline engagement fee for custom commissions.
 */

const artistProfileSchema = new Schema(
    {
        artistId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
            unique: true
        },
        bio: {
            type: String,
            trim: true
        },
        categories: [{
            type: String,
            trim: true
        }],
        location: {
            type: String,
            trim: true
        },
        availability: {
            type: Boolean,
            default: true
        },
        startingPrice: {
            type: Number,
            default: null
        },
        website: {
            type: String,
            trim: true
        },
        instagram: {
            type: String,
            trim: true
        },
        twitter: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

/**
 * @description Multi-field text index to support full-text search discovery.
 * Prioritizes bio, categories, and location in the MongoDB search engine.
 */
artistProfileSchema.index({ bio: "text", categories: "text", location: "text" });

export const ArtistProfile = mongoose.model("ArtistProfile", artistProfileSchema);
