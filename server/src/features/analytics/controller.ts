import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { getWorkspaceAnalytics } from "./service.js";
import { ensureWorkspaceMember } from "../../utils/authorization/workspace.js";

export const getAnalyticsController = asyncHandler(async (req: Request, res: Response) => {
    await ensureWorkspaceMember(req.user!.id, req.params!.workspaceId as string);

    const analytics = await getWorkspaceAnalytics(req.params!.workspaceId as string);

    res.status(200).json(analytics);
});