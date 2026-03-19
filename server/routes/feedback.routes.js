import { Router } from "express";
import { createFeedback, getFeedbackForArtwork, likeFeedback } from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createFeedback);
router.route("/artwork/:portfolioItemId").get(getFeedbackForArtwork); // Public
router.route("/:id/like").post(verifyJWT, likeFeedback);

export default router;
