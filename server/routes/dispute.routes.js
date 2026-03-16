import { Router } from "express";
import { 
    raiseDispute, 
    getDisputes, 
    resolveDispute 
} from "../controllers/dispute.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(raiseDispute);
router.route("/admin").get(verifyRole(['admin']), getDisputes);
router.route("/:id/resolve").patch(verifyRole(['admin']), resolveDispute);

export default router;
