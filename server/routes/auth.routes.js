import { Router } from "express";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    googleAuth,
    forgotPassword,
    verifyOtp,
    resetPassword,
    logout,
    logoutAll,
    refreshToken
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";


const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logout);
router.route("/logout-all").post(verifyJWT, logoutAll);
router.route("/refresh-token").post(refreshToken);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/me").put(
    verifyJWT, 
    upload.fields([
        { name: 'profileImage', maxCount: 1 },
        { name: 'bannerImage', maxCount: 1 }
    ]), 
    updateProfile
);

// Advanced Auth
router.route("/google").post(googleAuth);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyOtp);
router.route("/reset-password").post(resetPassword);

export default router;
