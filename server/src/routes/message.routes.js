import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

router.route("/").get(getMessages);
router.route("/").post(upload.single('image'), sendMessage);

export default router;
