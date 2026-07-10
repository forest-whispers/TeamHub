import type { Request, Response } from "express";
import *  as authService from "./auth.service.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";
import { clearAuthCookies, setAuthCookies } from "../../shared/utils/cookies.js";
import { constants } from "../../config/constants.js";
import { UnauthorizedError } from "../../shared/errors/index.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.register(req.body);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.sendStatus(204);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.login(req.body);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.sendStatus(204);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[constants.REFRESH_COOKIE_NAME];

    if (!refreshToken) {
        throw new UnauthorizedError("Refresh token not found");
    }

    const tokens = await authService.refresh(refreshToken);

    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.sendStatus(204);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[constants.REFRESH_COOKIE_NAME];

    if (refreshToken) {
        await authService.logout(refreshToken);
    }

    clearAuthCookies(res);

    res.sendStatus(204);
});