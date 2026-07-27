import { Router } from "express";
import authRouter from '../modules/auth/auth.routes.js';
import userRouter from "../modules/users/user.routes.js";
import workspaceRouter from "../modules/workspaces/workspace.routes.js";
import memberRouter from "../modules/members/member.routes.js";
import documentRouter from "../modules/documents/document.routes.js";
import activitiesRouter from "../modules/activity/activity.routes.js";
import messagesRouter from "../modules/chat/chat.routes.js";
import fileRouter from "../modules/files/file.routes.js";
import notificationRouter from "../modules/notifications/notification.routes.js";

export const router = Router();

router.get("/health", (_, res) => {
    res.status(200).json({
        status: "ok",
    });
});

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/notifications", notificationRouter);

router.use("/workspaces/:workspaceId/members", memberRouter);

router.use("/workspaces/:workspaceId/documents", documentRouter);

router.use("/workspaces/:workspaceId/documents/:documentId/chat", messagesRouter);

router.use("/workspaces/:workspaceId/activities", activitiesRouter);

router.use("/workspaces/:workspaceId/files", fileRouter);

router.use("/workspaces", workspaceRouter);