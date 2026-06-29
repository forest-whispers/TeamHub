import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/jwt.js";
import type { AuthUser } from "../modules/auth/auth.types.js";
import { ACCESS_COOKIE_NAME } from "../config/constants.js";
import { UnauthorizedError } from "../shared/errors/index.js";

export const authenticate = async ( req: Request, _res: Response, next: NextFunction ) => {
    const accessToken = req.cookies[ACCESS_COOKIE_NAME];

    if (!accessToken) {
        return next(new UnauthorizedError("Authentication required"));
    }

    try {
        const payload = verifyAccessToken(accessToken);

        const session = await prisma.session.findUnique({
            where: { id: payload.sessionId },
            include: { user: true },
        });

        if (!session) {
            throw new UnauthorizedError("Session not found");
        }

        if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { id: session.id } });
            throw new UnauthorizedError("Session expired");
        }

        req.user = session.user as AuthUser;

        next();
    } catch (error) {
        next(error);
    }
};