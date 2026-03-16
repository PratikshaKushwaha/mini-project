import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// GET /api/v1/posts  — public feed, paginated
const getPosts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, tag } = req.query;

    const query = {};
    if (type) query.type = type;
    if (tag)  query.tags = tag.toLowerCase();

    const posts = await Post.find(query)
        .populate("author", "email fullName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Post.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        posts,
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
    }, "Posts fetched successfully"));
});

// POST /api/v1/posts  — create (auth required)
const createPost = asyncHandler(async (req, res) => {
    const { type = "general", content, images = [], tags = [], budget, isOpen } = req.body;

    if (!content || content.trim().length < 5) {
        throw new ApiError(400, "Post content must be at least 5 characters");
    }

    // Only clients / artists can post (admins excluded intentionally)
    if (!["artist", "client", "admin"].includes(req.user.role)) {
        throw new ApiError(403, "Only artists and clients can create community posts");
    }

    // Requirement posts make sense for clients; artwork posts for artists
    // We allow both but surface the mismatch via authorRole so UI can distinguish

    const post = await Post.create({
        author: req.user._id,
        authorRole: req.user.role,
        type,
        content: content.trim(),
        images: Array.isArray(images) ? images.filter(Boolean) : [],
        tags: Array.isArray(tags) ? tags.map(t => t.toLowerCase().trim()).filter(Boolean) : [],
        budget: budget || undefined,
        isOpen: type === "requirement" ? (isOpen !== false) : undefined,
    });

    await post.populate("author", "email fullName");

    return res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});

// PATCH /api/v1/posts/:id/like  — toggle like (auth required)
const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.map(l => l.toString()).includes(userId);

    if (alreadyLiked) {
        post.likes = post.likes.filter(l => l.toString() !== userId);
    } else {
        post.likes.push(req.user._id);
    }

    await post.save();

    return res.status(200).json(new ApiResponse(200, {
        liked: !alreadyLiked,
        likesCount: post.likes.length,
    }, alreadyLiked ? "Post unliked" : "Post liked"));
});

// DELETE /api/v1/posts/:id  — delete own post (auth required)
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    const isOwner  = post.author.toString() === req.user._id.toString();
    const isAdmin  = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
        throw new ApiError(403, "You can only delete your own posts");
    }

    await post.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully"));
});

export { getPosts, createPost, toggleLike, deletePost };
