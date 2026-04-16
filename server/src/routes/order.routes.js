import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    setOrderPrice
} from "../controllers/order.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(verifyRole(['client']), createOrder);
router.route("/").get(getOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/status").patch(updateOrderStatus);
router.route("/:id/price").patch(verifyRole(['artist']), setOrderPrice);

export default router;
