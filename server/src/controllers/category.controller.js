import { Category } from "../models/category.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched"));
});

export const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const existing = await Category.findOne({ name });
    if (existing) throw new ApiError(409, "Category already exists");

    const category = await Category.create({ name, description });
    return res.status(201).json(new ApiResponse(201, category, "Category created"));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) throw new ApiError(404, "Category not found");
    return res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new ApiError(404, "Category not found");
    return res.status(200).json(new ApiResponse(200, null, "Category deleted"));
});
