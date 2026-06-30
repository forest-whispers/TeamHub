import type { Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import * as userService from "./user.service.js";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    const user = await userService.getMe(req.user.id);

    res.json(user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
    const user = await userService.updateMe(req.user.id, req.body);

    res.json(user);
});