import { prisma } from "../../../lib/prisma.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";
import type { CreateDiscussionDto, ReplyDiscussionDto, } from "./discussion.types.ts";

export async function getDiscussions( requesterId: string, workspaceId: string, documentId: string ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    return prisma.documentDiscussion.findMany({
        where: {
            documentId,
        },
        orderBy: {
            createdAt: "asc",
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
            replies: {
                orderBy: {
                    createdAt: "asc",
                },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });
}

export async function createDiscussion( requesterId: string, workspaceId: string, documentId: string, input: CreateDiscussionDto ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    return prisma.documentDiscussion.create({
        data: {
            documentId,
            createdById: requesterId,
            anchor: input.anchor,
            ...(input.quotedText && { quotedText: input.quotedText }),
            replies: {
                create: {
                    createdById: requesterId,
                    message: input.message,
                },
            },
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
            replies: {
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            },
        },
    });
}

export async function replyDiscussion( requesterId: string, discussionId: string, input: ReplyDiscussionDto ) {
    return prisma.documentDiscussionReply.create({
        data: {
            discussionId,
            createdById: requesterId,
            message: input.message,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });
}

export async function resolveDiscussion( requesterId: string, discussionId: string, resolved: boolean ) {
    const discussion = await prisma.documentDiscussion.findUniqueOrThrow({
        where: {
            id: discussionId,
        },
        select: {
            createdById: true,
        },
    });

    if (discussion.createdById !== requesterId) {
        throw new Error("Only the discussion creator can resolve it.");
    }

    return prisma.documentDiscussion.update({
        where: {
            id: discussionId,
        },
        data: {
            resolved,
            resolvedAt: resolved ? new Date() : null,
            resolvedById: resolved ? requesterId : null,
        },
    });
}

export async function deleteDiscussion( requesterId: string, discussionId: string ) {
    const discussion = await prisma.documentDiscussion.findUniqueOrThrow({
        where: {
            id: discussionId,
        },
        select: {
            createdById: true,
        },
    });

    if (discussion.createdById !== requesterId) {
        throw new Error("Only the discussion creator can delete it.");
    }

    await prisma.documentDiscussion.delete({
        where: {
            id: discussionId,
        },
    });
}

export async function deleteReply( requesterId: string, replyId: string ) {
    const reply = await prisma.documentDiscussionReply.findUniqueOrThrow({
        where: {
            id: replyId,
        },
        select: {
            createdById: true,
        },
    });

    if (reply.createdById !== requesterId) {
        throw new Error("Only the reply author can delete it.");
    }

    await prisma.documentDiscussionReply.delete({
        where: {
            id: replyId,
        },
    });
}