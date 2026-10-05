import { Router } from "express";
import { getSnapshotController, listSnapshotsController, } from "./controller.js";

const router = Router({ mergeParams: true });

router.get("/", listSnapshotsController);

router.get("/:snapshotId", getSnapshotController);

export default router;