import { prisma } from "../../lib/prisma.js";
import { BadRequestError } from "../../shared/errors/index.js";
import type { UpdateMemberDto } from "./member.types.js";
import { ensureWorkspaceMember, ensureWorkspaceOwner } from "../../shared/authorization/workspace.js";

const getWorkspaceMember = async (workspaceId: string, userId: string) =>
    await prisma.workspaceMember.findUniqueOrThrow({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId,
            },
        },
});

export const updateMember = async ( requesterId: string, workspaceId: string, targetUserId: string, data: UpdateMemberDto ) => {
    await ensureWorkspaceOwner(requesterId, workspaceId);

    const member = await getWorkspaceMember(workspaceId, targetUserId);

    if (requesterId === targetUserId && member.role === "OWNER") {
        throw new BadRequestError("Workspace owner cannot be modified.");
    }

    const updated = await prisma.workspaceMember.update({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: targetUserId,
            },
        },
        data: {
            role: data.role,
        },
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
    });

    return {
        id: updated.user.id,
        name: updated.user.name,
        email: updated.user.email,
        avatar: updated.user.avatar,
        role: updated.role,
        joinedAt: updated.joinedAt,
    };
};

export const removeMember = async ( requesterId: string, workspaceId: string, targetUserId: string) => {
    await ensureWorkspaceOwner(requesterId, workspaceId);

    const member = await getWorkspaceMember(workspaceId, targetUserId);

    if (requesterId === targetUserId) {
        throw new BadRequestError("Use the leave workspace action instead.");
    }

    if (member.role === "OWNER") {
        throw new BadRequestError("Workspace owner cannot be removed.");
    }

    await prisma.workspaceMember.delete({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: targetUserId,
            },
        },
    });
};

export const leaveWorkspace = async ( requesterId: string, workspaceId: string ) => {
    const member = await ensureWorkspaceMember(requesterId, workspaceId);

    if (member.role === "OWNER") {
        throw new BadRequestError("Transfer ownership before leaving the workspace.");
    }

    await prisma.workspaceMember.delete({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: requesterId,
            },
        },
    });
};