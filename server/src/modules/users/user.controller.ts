import type { NextFunction, Response } from "express";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import * as userService from "./user.service.js";
import type { AuthUser } from "../auth/auth.types.js";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.getMe((req.user as AuthUser).id);

    res.json(user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.updateMe((req.user as AuthUser).id, req.body);

    res.json(user);
});