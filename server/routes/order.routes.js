import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All order routes require authentication

router.route("/").post(verifyRole(['client']), createOrder);
router.route("/").get(getOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/status").patch(updateOrderStatus);

export default router;
