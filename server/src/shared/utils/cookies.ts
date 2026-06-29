import type { Response } from "express";
import { ACCESS_COOKIE_MAX_AGE, ACCESS_COOKIE_NAME, REFRESH_COOKIE_MAX_AGE, REFRESH_COOKIE_NAME } from "../../config/constants.js";
import { env } from "../../config/env.js";

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
});

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie(ACCESS_COOKIE_NAME, accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE));

    res.cookie(
        REFRESH_COOKIE_NAME,
        refreshToken,
        cookieOptions(REFRESH_COOKIE_MAX_AGE)
    );
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie(ACCESS_COOKIE_NAME);
    res.clearCookie(REFRESH_COOKIE_NAME);
};