import mongoose, { Schema } from "mongoose";

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
        // NOTE: profileImage is on the User model — no duplication here
    },
    { timestamps: true }
);

// Full-text search on bio and categories
artistProfileSchema.index({ bio: "text", categories: "text", location: "text" });

export const ArtistProfile = mongoose.model("ArtistProfile", artistProfileSchema);
