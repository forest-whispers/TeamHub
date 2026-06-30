import crypto from "crypto";
import { Prisma, type Workspace } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError, BadRequestError, ForbiddenError, NotFoundError } from "../../shared/errors/index.js";
import type { CreateWorkspaceDto, JoinWorkspaceDto, UpdateWorkspaceDto, WorkspaceResponse } from "./workspace.types.js";

const generateWorkspaceInviteCode = (): string => crypto.randomUUID();

const ensureWorkspaceMember = async (userId: string, workspaceId: string) => {
    await prisma.workspaceMember.findUniqueOrThrow({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            },
        },
    });
};

const ensureWorkspaceOwner = async (userId: string, workspaceId: string) => {
    await prisma.workspaceMember.findFirstOrThrow({
        where: {
            userId,
            workspaceId,
            role: "OWNER"
        }
    })
};

export const createWorkspace = async ( userId: string, data: CreateWorkspaceDto ): Promise<WorkspaceResponse> => {
    return prisma.$transaction(async (tx) => {
        let workspace: Workspace;
        let inviteCode = "";
        for (let attempt = 0; attempt < 2; attempt++) {
            inviteCode = generateWorkspaceInviteCode();

            try {
                workspace = await tx.workspace.create({
                    data: {
                        ...data,
                        inviteCode,
                        ownerId: userId,
                    },
                });
                break;
            } catch (error) {
                const isUniqueViolation = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

                if (!isUniqueViolation || attempt === 1) {
                    throw new AppError("Failed to generate invite code");
                }
            }
        }

        await tx.workspaceMember.create({
            data: {
                workspaceId: workspace.id,
                userId,
                role: "OWNER",
            },
        });

        return {
            id: workspace.id,
            inviteCode,
        };
    });
};

export const getWorkspaces = async (userId: string) => {
    const workspacesRaw =  prisma.workspace.findMany({
        where: {
            members: {
                some: { userId },
            },
        },
        select: {
            id: true,
            name: true,
            description: true,
            color: true,
            createdAt: true,
            _count: {
                select: {
                    members: true,
                },
            },
            members: {
                where: { userId },
                select: {
                    role: true,
                },
            },
        },
    });
    const workspaces = workspacesRaw.map((w: Workspace) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        color: w.color,
        createdAt: w.createdAt,
        role: w.members[0]?.role ?? null,
        memberCount: w._count.members,
      }));
};

export const getWorkspace = async (userId: string, workspaceId: string) => {
    await ensureWorkspaceMember(userId, workspaceId);

    return prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: {
            id: true,
            name: true,
            description: true,
            color: true,
            inviteCode: true,
            createdAt: true,
            ownerId: true,
            members: {
                select: {
                    role: true,
                    joinedAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });
};

export const updateWorkspace = async ( userId: string, workspaceId: string, data: UpdateWorkspaceDto ) => {
    await ensureWorkspaceOwner(userId, workspaceId);

    return prisma.workspace.update({
        where: { id: workspaceId },
        data,
    });
};

export const deleteWorkspace = async ( userId: string, workspaceId: string ) => {
    await ensureWorkspaceOwner(userId, workspaceId);

    await prisma.workspace.delete({
        where: { id: workspaceId },
    });
};

export const joinWorkspace = async ( userId: string, { inviteCode }: JoinWorkspaceDto ) => {
    const workspace = await prisma.workspace.findUnique({
        where: { inviteCode },
        select: {
            id: true,
            inviteCode: true,
        },
    });

    if (!workspace) {
        throw new NotFoundError("Workspace not found");
    }

    const membership = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: workspace.id,
                userId,
            },
        },
    });

    if (membership) {
        throw new BadRequestError("You are already a member of this workspace");
    }

    await prisma.workspaceMember.create({
        data: {
            workspaceId: workspace.id,
            userId,
            role: "MEMBER",
        },
    });

    return workspace;
};

export const regenerateInviteCode = async ( userId: string, workspaceId: string ) => {
    await ensureWorkspaceOwner(userId, workspaceId);

    let inviteCode = "";
    for (let attempt = 0; attempt < 2; attempt++) {
        inviteCode = generateWorkspaceInviteCode();

        try {
            return await prisma.workspace.update({
                where: { id: workspaceId, },
                data: { inviteCode, },
                select: {
                    id: true,
                    inviteCode: true,
                },
            });
        } catch (error) {
            const isUniqueViolation = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && error.meta?.target?.includes("inviteCode");

            if (!isUniqueViolation || attempt === 1) {
                throw new AppError("Failed to generate invite code");
            }
        }
    }
};