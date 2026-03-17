
import express from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { verifyJWT, verifyRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getCategories);
router.route("/").post(verifyJWT, verifyRole(['admin']), createCategory);
router.route("/:id").patch(verifyJWT, verifyRole(['admin']), updateCategory);
router.route("/:id").delete(verifyJWT, verifyRole(['admin']), deleteCategory);

export default router;
