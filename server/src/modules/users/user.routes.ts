import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { getMe, updateMe } from "./user.controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./user.validator.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);

router.patch("/me", validate(validator.updateMeSchema), updateMe);

export default router;