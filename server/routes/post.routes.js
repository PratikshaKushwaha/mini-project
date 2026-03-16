import { Router } from "express";
import { getPosts, createPost, toggleLike, deletePost } from "../controllers/post.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getPosts);                          // public feed
router.post("/", verifyJWT, createPost);            // auth: create
router.patch("/:id/like", verifyJWT, toggleLike);   // auth: toggle like
router.delete("/:id", verifyJWT, deletePost);       // auth: delete own post

export default router;
