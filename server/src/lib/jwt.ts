import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../config/constants.js";
import { env } from "../config/env.js";
import type { JwtPayload } from "../modules/auth/auth.types.js";

export const generateAccessToken = (payload: JwtPayload) =>
    jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });

export const generateRefreshToken = (payload: JwtPayload) =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
    });

export const verifyAccessToken = (token: string) =>
    jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

export const verifyRefreshToken = (token: string) =>
    jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;