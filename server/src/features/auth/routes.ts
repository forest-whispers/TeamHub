import { Router } from "express";
import { login, logout, refresh, register } from "./controller.js";
import { validate } from "../../middleware/validate.js";
import * as validator from "./validator.js";

const router = Router();

router.post("/register", validate(validator.registerSchema), register);

router.post("/login", validate(validator.loginSchema), login);

router.post("/refresh", refresh);

router.post("/logout", logout);

export default router;