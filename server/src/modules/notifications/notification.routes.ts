import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import {
    getNotificationsController,
    readNotificationController,
    readAllNotificationsController,
} from "./notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getNotificationsController);
router.patch("/read-all", readAllNotificationsController);
router.patch("/:notificationId/read", readNotificationController);

export default router;