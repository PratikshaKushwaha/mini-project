import { Router } from "express";
import {
    getPosts,
    createPost,
    toggleLike,
    addComment
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Public route to view posts
router.route("/").get(getPosts);

// Protected routes to interact with posts
router.use(verifyJWT); // Secure the rest
router.route("/").post(upload.single("image"), createPost);
router.route("/:id/like").put(toggleLike);
router.route("/:id/comment").post(addComment);

export default router;
