import express from "express";
import { getSystemStats, getAllUsers, deleteUser, updateUserRole } from "../controllers/admin.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth and admin check to all routes
router.use(verifyJWT, verifyRole("admin"));

router.route("/stats").get(getSystemStats);
router.route("/users").get(getAllUsers);
router.route("/users/:id").delete(deleteUser).patch(updateUserRole);

export default router;
