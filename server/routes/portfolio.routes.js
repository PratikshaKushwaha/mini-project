import { Router } from "express";
import {
    addPortfolioItem,
    getArtistPortfolio,
    deletePortfolioItem
} from "../controllers/portfolio.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, verifyRole(['artist']), addPortfolioItem);
router.route("/:artistId").get(getArtistPortfolio);
router.route("/:id").delete(verifyJWT, verifyRole(['artist']), deletePortfolioItem);

export default router;
