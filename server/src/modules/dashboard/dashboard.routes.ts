import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { getDashboard } from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getDashboard);

export default router;