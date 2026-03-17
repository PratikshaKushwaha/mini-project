import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

const postSchema = new Schema(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        body: {
            type: String,
            required: true
        },
        tag: {
            type: String,
            default: "Discussion"
        },
        image: {
            type: String // Cloudinary URL
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }],
        comments: [commentSchema]
    },
    { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
