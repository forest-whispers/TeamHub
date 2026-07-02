import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { updateMember, removeMember, leaveWorkspace } from "./member.service.js";

export const updateMemberController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await updateMember(req.user!.id, req.params.workspaceId, req.params.userId, req.body));
});

export const removeMemberController = asyncHandler(async (req: Request, res: Response) => {
    await removeMember(req.user!.id, req.params.workspaceId, req.params.userId);

    res.sendStatus(204);
});

export const leaveWorkspaceController = asyncHandler(async (req: Request, res: Response) => {
    await leaveWorkspace(req.user!.id, req.params.workspaceId);

    res.sendStatus(204);
});