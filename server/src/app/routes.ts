import { Router } from "express";
import authRouter from '../features/auth/routes.js';
import userRouter from "../features/users/routes.js";
import workspaceRouter from "../features/workspaces/routes.js";
import memberRouter from "../features/members/routes.js";
import documentRouter from "../features/documents/routes.js";
import activitiesRouter from "../features/activity/routes.js";
import messagesRouter from "../features/chat/routes.js";
import fileRouter from "../features/files/routes.js";
import notificationRouter from "../features/notifications/routes.js";
import searchRouter from "../features/search/routes.js";
import analyticsRouter from "../features/analytics/routes.js";
import dashboardRouter from "../features/dashboard/routes.js";


export const router = Router();

router.get("/health", (_, res) => {
    res.status(200).json({
        status: "ok",
    });
});

router.use("/auth", authRouter);

router.use("/users", userRouter);

router.use("/notifications", notificationRouter);

router.use("/search", searchRouter);

router.use("/dashboard", dashboardRouter);

router.use("/workspaces/:workspaceId/members", memberRouter);

router.use("/workspaces/:workspaceId/documents", documentRouter);

router.use("/workspaces/:workspaceId/documents/:documentId/chat", messagesRouter);

router.use("/workspaces/:workspaceId/activities", activitiesRouter);

router.use("/workspaces/:workspaceId/files", fileRouter);

router.use("/workspaces/:workspaceId/analytics", analyticsRouter);

router.use("/workspaces", workspaceRouter);