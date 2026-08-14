import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { getWorkspaceAnalytics } from "./analytics.service.js";
import { ensureWorkspaceMember } from "../../shared/authorization/workspace.js";

export const getAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
    await ensureWorkspaceMember(req.user!.id, req.params!.workspaceId);

    const analytics = await getWorkspaceAnalytics(req.params!.workspaceId);

    res.status(200).json(analytics);
});