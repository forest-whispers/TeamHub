import { prisma } from "../../lib/prisma.js";
import type { User } from "@prisma/client";

interface UpdateMeDto {
    name?: string;
    avatar?: string | null;
}

export const getMe = async (userId: string) => {
    return prisma.user.findUniqueOrThrow({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isEmailVerified: true,
        },
    });
};

export const updateMe = async (userId: string, data: UpdateMeDto) => {
    return prisma.user.update({
        where: { id: userId },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            isEmailVerified: true,
        },
    });
};