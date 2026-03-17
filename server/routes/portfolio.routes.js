import { Router } from "express";
import {
    addPortfolioItem,
    getArtistPortfolio,
    deletePortfolioItem,
    updatePortfolioItem
} from "../controllers/portfolio.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, verifyRole(['artist']), upload.single('image'), addPortfolioItem);
router.route("/:artistId").get(getArtistPortfolio);
router.route("/:id").patch(verifyJWT, verifyRole(['artist']), upload.single('image'), updatePortfolioItem);
router.route("/:id").delete(verifyJWT, verifyRole(['artist', 'admin']), deletePortfolioItem);

export default router;
