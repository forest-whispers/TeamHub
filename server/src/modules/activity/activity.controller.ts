import type { Request, Response } from "express";

import { getWorkspaceActivities } from "./activity.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";

export const getWorkspaceActivitiesController = asyncHandler(async ( req: Request, res: Response) => {
    const requesterId = req.user!.id;

    const workspaceId = req.params.workspaceId;

    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

    const rawLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;

    const limit = rawLimit !== undefined && Number.isFinite(rawLimit) ? rawLimit : undefined;

    const result = await getWorkspaceActivities(
        requesterId,
        workspaceId as string,
        {
            ...(cursor !== undefined && { cursor }),
            ...(limit !== undefined && { limit }),
        }
    );

    res.status(200).json({
        success: true,
        data: result,
    });
})