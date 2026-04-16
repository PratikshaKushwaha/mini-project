import { Router } from "express";
import {
  createReview,
  getArtistReviews,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createReview);
router.route("/artist/:artistId").get(getArtistReviews);

export default router;
