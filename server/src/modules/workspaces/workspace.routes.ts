import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { createWorkspace, deleteWorkspace, getWorkspace, getWorkspaces, joinWorkspace, regenerateInviteCode, updateWorkspace } from "./workspace.controller.js";

const router = Router();

router.use(authenticate);

router.post("/", createWorkspace);

router.get("/", getWorkspaces);

router.post("/join", joinWorkspace);

router.get("/:workspaceId", getWorkspace);

router.patch("/:workspaceId", updateWorkspace);

router.delete("/:workspaceId", deleteWorkspace);

router.post("/:workspaceId/invite-code/regenerate", regenerateInviteCode);

export default router;