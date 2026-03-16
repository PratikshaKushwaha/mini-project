
import express from "express";
import { getCategories } from "../controllers/category.controller.js";

const router = express.Router();

router.route("/").get(getCategories);

export default router;
