import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { updateMemberController, removeMemberController, leaveWorkspaceController } from "./member.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.patch("/:userId", updateMemberController);

router.delete("/:userId", removeMemberController);

router.post("/leave", leaveWorkspaceController);

export default router;