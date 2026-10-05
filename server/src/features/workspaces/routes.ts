import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { createWorkspace, deleteWorkspace, getWorkspace, getWorkspaces, getWorkspaceHome, joinWorkspace, regenerateInviteCode, updateWorkspace } from "./controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./validator.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(validator.createWorkspaceSchema), createWorkspace);

router.get("/", getWorkspaces);

router.post("/join", validate(validator.joinWorkspaceSchema), joinWorkspace);

router.get("/:workspaceId", getWorkspace);

router.get("/:workspaceId/home", getWorkspaceHome);

router.patch("/:workspaceId", validate(validator.updateWorkspaceSchema), updateWorkspace);

router.delete("/:workspaceId", deleteWorkspace);

router.post("/:workspaceId/invite-code/regenerate", regenerateInviteCode);

export default router;