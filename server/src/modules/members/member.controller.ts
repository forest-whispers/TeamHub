import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { getMembers, getMember, updateMember, removeMember, leaveWorkspace } from "./member.service.js";

export const getMembersController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await getMembers(req.user!.id, req.params.workspaceId));
});

export const getMemberController = asyncHandler(async (req: Request, res: Response) => {
    res.json(await getMember(req.user!.id, req.params.workspaceId, req.params.userId));
});

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