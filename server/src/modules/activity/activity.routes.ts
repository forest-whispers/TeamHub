import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { getWorkspaceActivitiesController } from "./activity.controller.js";

const router = Router();

router.use(authenticate);

router.get( "/", getWorkspaceActivitiesController );

export default router;