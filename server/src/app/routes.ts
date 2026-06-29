import { Router } from "express";
import authRouter from '../modules/auth/auth.routes.js';

export const router = Router();

router.get("/health", (_, res) => {
    res.status(200).json({
        status: "ok",
    });
});

router.use("/auth", authRouter);