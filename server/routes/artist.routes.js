import { Router } from "express";
import {
    updateArtistProfile,
    getArtistProfile,
    browseArtists
} from "../controllers/artist.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/profile").post(verifyJWT, verifyRole(['artist']), updateArtistProfile);
router.route("/:artistId").get(getArtistProfile);
router.route("/").get(browseArtists);

export default router;
