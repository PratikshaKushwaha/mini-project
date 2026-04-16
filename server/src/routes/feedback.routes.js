import { Router } from "express";
import { submitFeedback, getFeedback } from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, submitFeedback);
router.route("/artwork/:portfolioItemId").get(getFeedback); // Public
// router.route("/:id/like").post(verifyJWT, likeFeedback);

export default router
