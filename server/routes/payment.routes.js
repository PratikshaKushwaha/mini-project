import { Router } from "express";
import {
    createConnectAccount,
    createCheckoutSession
} from "../controllers/payment.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All payment routes require authentication

router.route("/connect").post(verifyRole(['artist']), createConnectAccount);
router.route("/checkout").post(verifyRole(['client']), createCheckoutSession);

export default router;
