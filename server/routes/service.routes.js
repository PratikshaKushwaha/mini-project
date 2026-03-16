import { Router } from "express";
import {
    createService,
    getArtistServices
} from "../controllers/service.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, verifyRole(['artist']), createService);
router.route("/artist/:artistId").get(getArtistServices);

export default router;
