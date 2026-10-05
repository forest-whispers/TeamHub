import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { getMe, updateMe } from "./controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./validator.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);

router.patch("/me", validate(validator.updateMeSchema), updateMe);

export default router;