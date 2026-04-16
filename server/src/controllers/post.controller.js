import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate("author", "fullName username profileImage role email")
        .populate("comments.user", "fullName username profileImage")
        .sort({ createdAt: -1 });
    
    return res.status(200).json(new ApiResponse(200, posts, "Community posts fetched"));
});

export const createPost = asyncHandler(async (req, res) => {
    const { title, body, tag } = req.body;
    
    let imageUrl = null;
    if (req.file) {
        const cloudinaryResponse = await uploadOnCloudinary(req.file.buffer);
        if (cloudinaryResponse) imageUrl = cloudinaryResponse.url;
    }

    const post = await Post.create({
        author: req.user._id,
        title,
        body,
        tag: tag || "Discussion",
        image: imageUrl
    });

    const populatedPost = await Post.findById(post._id).populate("author", "fullName username profileImage role email");

    return res.status(201).json(new ApiResponse(201, populatedPost, "Post created successfully"));
});

export const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    const index = post.likes.indexOf(req.user._id);
    let isLiked = false;
    if (index === -1) {
        post.likes.push(req.user._id);
        isLiked = true;
    } else {
        post.likes.splice(index, 1);
        isLiked = false;
    }

    await post.save();
    return res.status(200).json(new ApiResponse(200, { isLiked, count: post.likes.length }, "Like status toggled"));
});

export const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) throw new ApiError(400, "Comment text is required");

    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    post.comments.push({
        user: req.user._id,
        text
    });

    await post.save();
    
    const updatedPost = await Post.findById(post._id)
        .populate("author", "fullName username profileImage role email")
        .populate("comments.user", "fullName username profileImage");

    return res.status(201).json(new ApiResponse(201, updatedPost, "Comment added"));
});

export const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "Unauthorized to delete this post");
    }

    await post.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Post deleted"));
});
