import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { getWorkspaceActivitiesController } from "./controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get( "/", getWorkspaceActivitiesController );

export default router;