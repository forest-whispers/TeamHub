import type { Socket, ExtendedError } from "socket.io";
import { parseCookie } from "cookie";

import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../modules/auth/auth.types.js";
import { verifyAccessToken } from "../../lib/jwt.js";
import { UnauthorizedError } from "../../shared/errors/index.js";

export async function socketAuth(socket: Socket, next: (err?: ExtendedError) => void) {
    try {
        console.log("socket auth requested")
        const cookies = socket.request.headers.cookie || "";
        const parsed = parseCookie(cookies);
        const token = parsed.accessToken;

        // const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const payload = verifyAccessToken(token);

        if (!payload.sub || !payload.sessionId) {
            return next(new Error("Invalid token"));
        }

        const session = await prisma.session.findUnique({
            where: { id: payload.sessionId },
            select: {
                id: true,
                expiresAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!session) {
            throw new UnauthorizedError("Session not found");
        }

        if (session.expiresAt < new Date()) {
            await prisma.session.delete({ where: { id: session.id } });
            throw new UnauthorizedError("Session expired");
        }

        console.log("socket auth")

        const user = session.user as AuthUser;

        socket.data.user = {
            ...user,
            sessionId: payload.sessionId,
        };

        next();
    } catch {
        next(new Error("Unauthorized"));
    }
}