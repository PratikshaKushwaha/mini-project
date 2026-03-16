import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        authorRole: {
            type: String,
            enum: ["artist", "client", "admin"],
            required: true,
        },
        type: {
            type: String,
            enum: ["artwork", "requirement", "general"],
            default: "general",
            index: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        images: [{ type: String, trim: true }], // image URLs
        tags: [{ type: String, trim: true, lowercase: true }],
        likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
        commentsCount: { type: Number, default: 0 },
        // For "requirement" posts
        isOpen: { type: Boolean, default: true },
        budget: { type: String, trim: true },
    },
    { timestamps: true }
);

// Text index for search
postSchema.index({ content: "text", tags: "text" });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
