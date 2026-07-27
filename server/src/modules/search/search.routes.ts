import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { searchController } from "./search.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/", searchController);

export default router;