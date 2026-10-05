import type { Request, Response } from "express";
import asyncHandler from "../../../utils/asyncHandler.js";
import { snapshotService } from "./service.js";

export const listSnapshotsController = asyncHandler(async ( req: Request, res: Response ) => {
    const snapshots = await snapshotService.listSnapshots(
        req.user!.id,
        req.params.workspaceId as string,
        req.params.documentId as string
    );

    res.json(snapshots);
})

export const getSnapshotController = asyncHandler(async (req: Request, res: Response) => {
        const snapshot = await snapshotService.getSnapshot(
            req.user!.id,
            req.params.workspaceId as string,
            req.params.documentId as string,
            req.params.snapshotId as string
        );

        res.json(snapshot);
    }
);