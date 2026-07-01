import { WorkspaceRole } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { ForbiddenError } from "../errors/index.js";

export const ensureWorkspaceMember = async (userId: string, workspaceId: string) => {
    return prisma.workspaceMember.findUniqueOrThrow({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            },
        },
    });
};

export const ensureWorkspaceRole = async ( userId: string, workspaceId: string, ...roles: WorkspaceRole[] ) => {
    const member = await ensureWorkspaceMember(userId, workspaceId);

    if (!roles.includes(member.role)) {
        throw new ForbiddenError("You don't have permission to perform this action.");
    }

    return member;
};

export const ensureWorkspaceOwner = async (userId: string, workspaceId: string) => {
    return ensureWorkspaceRole(userId, workspaceId, WorkspaceRole.OWNER);
};

export const ensureWorkspaceAdmin = async (userId: string, workspaceId: string) => {
    return ensureWorkspaceRole(userId, workspaceId, WorkspaceRole.ADMIN, WorkspaceRole.OWNER);
};