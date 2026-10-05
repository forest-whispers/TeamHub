import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler.js";
import { updateMember, removeMember, leaveWorkspace } from "./service.js";

export const updateMemberController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await updateMember(req.user!.id, req.params.workspaceId as string, req.params.userId as string, req.body));
});

export const removeMemberController = asyncHandler(async (req: Request, res: Response) => {
    await removeMember(req.user!.id, req.params.workspaceId as string, req.params.userId as string);

    res.sendStatus(204);
});

export const leaveWorkspaceController = asyncHandler(async (req: Request, res: Response) => {
    await leaveWorkspace(req.user!.id, req.params.workspaceId as string);

    res.sendStatus(204);
});