import { Router } from "express";
import {
    addPortfolioItem,
    getArtistPortfolio,
    deletePortfolioItem,
    updatePortfolioItem,
    toggleLike,
    toggleAvailability
} from "../controllers/portfolio.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, verifyRole(['artist']), upload.single('image'), addPortfolioItem);
router.route("/:artistId").get(getArtistPortfolio);
router.route("/:id").patch(verifyJWT, verifyRole(['artist']), upload.single('image'), updatePortfolioItem);
router.route("/:id").delete(verifyJWT, verifyRole(['artist', 'admin']), deletePortfolioItem);
router.route("/:id/like").post(verifyJWT, toggleLike);
router.route("/:id/availability").patch(verifyJWT, verifyRole(['artist']), toggleAvailability);

export default router;
