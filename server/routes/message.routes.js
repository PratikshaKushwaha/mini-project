import { Router } from "express";
import {
    sendMessage,
    getOrderMessages
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

router.route("/messages").post(sendMessage);
router.route("/messages").get(getOrderMessages);

export default router;
