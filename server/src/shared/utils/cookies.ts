import type { Response } from "express";
import { constants } from "../../config/constants.js";
import { env } from "../../config/env.js";

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production") ? "none" : "lax",
    maxAge,
}) as const;

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie(constants.ACCESS_COOKIE_NAME, accessToken, cookieOptions(constants.ACCESS_COOKIE_MAX_AGE));

    res.cookie(
        constants.REFRESH_COOKIE_NAME,
        refreshToken,
        cookieOptions(constants.REFRESH_COOKIE_MAX_AGE)
    );
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie(constants.ACCESS_COOKIE_NAME);
    res.clearCookie(constants.REFRESH_COOKIE_NAME);
};