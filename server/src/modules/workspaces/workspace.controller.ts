import type { Request, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import * as workspaceService from "./workspace.service.js";

export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.createWorkspace(req.user!.id, req.body);

    res.status(201).json(workspace);
});

export const getWorkspaces = asyncHandler(async (req: Request, res: Response) => {
    const workspaces = await workspaceService.getWorkspaces(req.user!.id);

    res.json(workspaces);
});

export const getWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.getWorkspace(req.user!.id, req.params.workspaceId);

    res.json(workspace);
});

export const updateWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.updateWorkspace(
        req.user!.id,
        req.params.workspaceId,
        req.body
    );

    res.json(workspace);
});

export const deleteWorkspace = asyncHandler(async (req: Request, res: Response) => {
    await workspaceService.deleteWorkspace(req.user!.id, req.params.workspaceId);

    res.sendStatus(204);
});

export const joinWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.joinWorkspace(req.user!.id, req.body);

    res.status(201).json(workspace);
});

export const regenerateInviteCode = asyncHandler(async (req: Request, res: Response) => {
    const workspace = await workspaceService.regenerateInviteCode(
        req.user!.id,
        req.params.workspaceId
    );

    res.json(workspace);
});