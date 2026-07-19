import type { Request, Response } from "express";
import asyncHandler from "../../../shared/utils/asyncHandler.js";
import { snapshotService } from "./snapshot.service.js";

export const listSnapshotsController = asyncHandler(async ( req: Request, res: Response ) => {
    const snapshots = await snapshotService.listSnapshots(
        req.user!.id,
        req.params.workspaceId,
        req.params.documentId
    );

    res.json(snapshots);
})

export const getSnapshotController = asyncHandler(async (req: Request, res: Response) => {
        const snapshot = await snapshotService.getSnapshot(
            req.user!.id,
            req.params.workspaceId,
            req.params.documentId,
            req.params.snapshotId
        );

        res.json(snapshot);
    }
);