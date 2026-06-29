import { prisma } from "../../lib/prisma.js";
import { comparePassword, hashPassword } from "../../lib/bcrypt.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../lib/jwt.js";
import { hashToken } from "../../lib/hash.js";
import { ConflictError, UnauthorizedError } from "../../shared/errors/index.js";
import { getRefreshTokenExpiry } from "../../shared/utils/date.js";
import type { AuthResult, JwtPayload, LoginDto, RegisterDto } from "./auth.types.js";

const generateTokens = (payload: JwtPayload): AuthResult => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
        sessionId: payload.sessionId,
        accessToken,
        refreshToken,
    };
};

const createSession = async (userId: string) => {
    return prisma.session.create({
        data: {
            userId,
            refreshTokenHash: "",
            expiresAt: getRefreshTokenExpiry(),
        },
    });
};

const updateRefreshToken = async (sessionId: string, refreshToken: string) => {
    return prisma.session.update({
        where: { id: sessionId },
        data: {
            refreshTokenHash: hashToken(refreshToken),
            expiresAt: getRefreshTokenExpiry(),
            lastUsedAt: new Date(),
        },
    });
};

export const register = async ({ name, email, password }: RegisterDto): Promise<AuthResult> => {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
        throw new ConflictError("Email already registered");
    }

    const hashedPassword = await hashPassword(password);

    const { user, session } = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const session = await tx.session.create({
            data: {
                userId: user.id,
                refreshTokenHash: "",
                expiresAt: getRefreshTokenExpiry(),
            },
        });

        return { user, session };
    });

    const tokens = generateTokens({
        sub: user.id,
        sessionId: session.id,
    });

    await updateRefreshToken(session.id, tokens.refreshToken);

    return tokens;
};

export const login = async ({ email, password }: LoginDto): Promise<AuthResult> => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password))) {
        throw new UnauthorizedError("Invalid email or password");
    }

    const session = await createSession(user.id);

    const tokens = generateTokens({
        sub: user.id,
        sessionId: session.id,
    });

    await updateRefreshToken(session.id, tokens.refreshToken);

    return tokens;
};

export const refresh = async (refreshToken: string): Promise<AuthResult> => {
    const payload = verifyRefreshToken(refreshToken);

    const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
    });

    if (!session) {
        throw new UnauthorizedError("Invalid session");
    }

    if (session.expiresAt < new Date()) {
        await prisma.session.delete({ where: { id: session.id } });
        throw new UnauthorizedError("Session expired");
    }

    if (session.refreshTokenHash !== hashToken(refreshToken)) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const tokens = generateTokens({
        sub: payload.sub,
        sessionId: session.id,
    });

    await updateRefreshToken(session.id, tokens.refreshToken);

    return tokens;
};

export const logout = async (refreshToken: string) => {
    const payload = verifyRefreshToken(refreshToken);

    await prisma.session.deleteMany({
        where: {
            id: payload.sessionId,
            refreshTokenHash: hashToken(refreshToken),
        },
    });
};