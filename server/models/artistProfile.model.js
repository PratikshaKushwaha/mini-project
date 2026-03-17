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
        },
        profileImage: {
            type: String // Cloudinary URL
        }
    },
    { timestamps: true }
);

export const ArtistProfile = mongoose.model("ArtistProfile", artistProfileSchema);
