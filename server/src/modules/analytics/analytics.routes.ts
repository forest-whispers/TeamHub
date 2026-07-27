import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { getAnalyticsController } from "./analytics.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", getAnalyticsController);

export default router;
