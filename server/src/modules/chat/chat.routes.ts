import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate.js";

import {
    getMessagesController,
    sendMessageController,
    editMessageController,
    deleteMessageController,
    pinMessageController,
    unpinMessageController,
    toggleReactionController,
} from "./chat.controller.js";

import * as validator from "./chat.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", getMessagesController);

router.post(
    "/",
    validate(validator.sendMessageSchema),
    sendMessageController
);

router.patch(
    "/:messageId",
    validate(validator.editMessageSchema),
    editMessageController
);

router.delete(
    "/:messageId",
    deleteMessageController
);

router.patch(
    "/:messageId/pin",
    pinMessageController
);

router.delete(
    "/:messageId/pin",
    unpinMessageController
);

router.post(
    "/:messageId/reaction",
    validate(validator.toggleReactionSchema),
    toggleReactionController
);

export default router;