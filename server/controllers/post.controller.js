import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// @desc    Get all active posts with author info
// @route   GET /api/v1/posts
const getPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate("author", "email fullName role")
        .populate("comments.user", "email fullName role")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "Posts retrieved successfully"));
});

// @desc    Create a new post
// @route   POST /api/v1/posts
const createPost = asyncHandler(async (req, res) => {
    const { title, body, tag } = req.body;

    if (!title || !body) {
        throw new ApiError(400, "Title and body are required to create a post");
    }

    let cloudImgUrl = "";
    if (req.file) {
        const uploadResponse = await uploadOnCloudinary(req.file.buffer);
        if (!uploadResponse) {
            throw new ApiError(500, "Failed to upload image to cloudinary");
        }
        cloudImgUrl = uploadResponse.url;
    }

    const post = await Post.create({
        author: req.user._id,
        title,
        body,
        tag: tag || "Discussion",
        image: cloudImgUrl || null
    });

    const populatedPost = await Post.findById(post._id)
        .populate("author", "email fullName role");

    return res
        .status(201)
        .json(new ApiResponse(201, populatedPost, "Post created successfully"));
});

// @desc    Like / Unlike a post
// @route   PUT /api/v1/posts/:id/like
const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
        post.likes.pull(req.user._id);
    } else {
        post.likes.push(req.user._id);
    }

    await post.save();

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: !isLiked, likesCount: post.likes.length }, "Like toggled"));
});

// @desc    Add a comment
// @route   POST /api/v1/posts/:id/comment
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    if (!text) throw new ApiError(400, "Comment text is required");

    const post = await Post.findById(req.params.id);
    if (!post) throw new ApiError(404, "Post not found");

    post.comments.push({
        user: req.user._id,
        text
    });

    await post.save();

    const updatedPost = await Post.findById(req.params.id)
        .populate("author", "email fullName role")
        .populate("comments.user", "email fullName role");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPost, "Comment added successfully"));
});

export { getPosts, createPost, toggleLike, addComment };
