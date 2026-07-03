import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { updateMemberController, removeMemberController, leaveWorkspaceController } from "./member.controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./member.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.patch("/:userId", validate(validator.updateMemberSchema), updateMemberController);

router.delete("/:userId", removeMemberController);

router.post("/leave", leaveWorkspaceController);

export default router;