import { prisma } from "../../../lib/prisma.js";
import { eventBus } from "../../../infrastructure/events/event-bus.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";
import type { CreateDiscussionDto, ReplyDiscussionDto, } from "./discussion.types.ts";

async function getMentionedUserIdsFromText(text: string, workspaceId: string): Promise<string[]> {
    const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: { select: { id: true, name: true } } }
    });
    const mentionedUserIds: string[] = [];
    const lowerText = text.toLowerCase();
    for (const member of members) {
        const namePart = member.user.name.toLowerCase();
        if (lowerText.includes(`@${namePart}`) || lowerText.includes(`@${namePart.replace(/\s+/g, "")}`)) {
            mentionedUserIds.push(member.user.id);
        }
    }
    return mentionedUserIds;
}

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

export async function createDiscussion( requesterId: string, workspaceId: string, documentId: string, input: CreateDiscussionDto, socketId?: string ) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const discussion = await prisma.documentDiscussion.create({
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

    await eventBus.emit("discussion.created", {
        documentId,
        discussion,
        socketId,
    });

    // Emit discussion.mentioned for each user mentioned (excluding self)
    const mentionedUserIds = await getMentionedUserIdsFromText(input.message, workspaceId);
    for (const recipientId of mentionedUserIds) {
        if (recipientId !== requesterId) {
            await eventBus.emit("discussion.mentioned", {
                workspaceId,
                documentId,
                discussionId: discussion.id,
                actorId: requesterId,
                recipientId,
            });
        }
    }

    return discussion;
}

export async function replyDiscussion( requesterId: string, discussionId: string, input: ReplyDiscussionDto, socketId?: string ) {
    const discussion = await prisma.documentDiscussion.findUniqueOrThrow({
        where: { id: discussionId },
        select: {
            documentId: true,
            createdById: true,
            document: {
                select: {
                    workspaceId: true,
                }
            }
        }
    });
    const workspaceId = discussion.document.workspaceId;
    const documentId = discussion.documentId;

    const reply = await prisma.documentDiscussionReply.create({
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

    await eventBus.emit("discussion.reply.created", {
        documentId: input.documentId,
        discussionId,
        reply,
        socketId,
    });

    // Emit discussion.replied to the discussion creator (excluding self)
    if (discussion.createdById !== requesterId) {
        await eventBus.emit("discussion.replied", {
            workspaceId,
            documentId,
            discussionId,
            actorId: requesterId,
            recipientId: discussion.createdById,
        });
    }

    // Emit discussion.mentioned for mentions inside the reply (excluding self)
    const mentionedUserIds = await getMentionedUserIdsFromText(input.message, workspaceId);
    for (const recipientId of mentionedUserIds) {
        if (recipientId !== requesterId) {
            await eventBus.emit("discussion.mentioned", {
                workspaceId,
                documentId,
                discussionId,
                actorId: requesterId,
                recipientId,
            });
        }
    }

    return reply;
}

export async function resolveDiscussion( requesterId: string, discussionId: string, resolved: boolean, socketId?: string ) {
    const discussion = await prisma.documentDiscussion.findUniqueOrThrow({
        where: {
            id: discussionId,
        },
        select: {
            documentId: true, 
            createdById: true,
            document: {
                select: {
                    workspaceId: true
                }
            }
        },
    });

    if (discussion.createdById !== requesterId) {
        throw new Error("Only the discussion creator can resolve it.");
    }

    const resolvedDiscussion = await prisma.documentDiscussion.update({
        where: {
            id: discussionId,
        },
        data: {
            resolved,
            resolvedAt: resolved ? new Date() : null,
            resolvedById: resolved ? requesterId : null,
        },
    });

    await eventBus.emit("discussion.updated", {
        documentId: discussion.documentId,
        discussion: resolvedDiscussion,
        socketId,
    });

    // Emit discussion.resolved to participants (creator + unique repliers, excluding resolver/actor)
    if (resolved) {
        const workspaceId = discussion.document.workspaceId;

        const repliers = await prisma.documentDiscussionReply.findMany({
            where: { discussionId },
            select: { createdById: true },
            distinct: ["createdById"],
        });

        const recipients = new Set<string>();
        if (discussion.createdById !== requesterId) {
            recipients.add(discussion.createdById);
        }
        for (const r of repliers) {
            if (r.createdById !== requesterId) {
                recipients.add(r.createdById);
            }
        }

        for (const recipientId of recipients) {
            await eventBus.emit("discussion.resolved", {
                workspaceId,
                documentId: discussion.documentId,
                discussionId,
                actorId: requesterId,
                recipientId,
            });
        }
    }

    return resolvedDiscussion;
}

export async function deleteDiscussion( requesterId: string, discussionId: string, socketId?: string ) {
    const discussion = await prisma.documentDiscussion.findUniqueOrThrow({
        where: {
            id: discussionId,
        },
        select: {
            documentId: true,
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

    await eventBus.emit("discussion.deleted", {
        documentId: discussion.documentId,
        discussionId,
        socketId,
    });
}

export async function deleteReply( requesterId: string, replyId: string, socketId?: string ) {
    const reply = await prisma.documentDiscussionReply.findUniqueOrThrow({
        where: {
            id: replyId,
        },
        select: {
            discussionId: true,
            createdById: true,
        },
    });

    if (reply.createdById !== requesterId) {
        throw new Error("Only the reply author can delete it.");
    }

    const deletedDiscussion = await prisma.documentDiscussionReply.delete({
        where: {
            id: replyId,
        },
        select : {
            discussion: {
            select: {
                documentId: true,
            },
        },
    }});

    await eventBus.emit("discussion.reply.deleted", {
        documentId: deletedDiscussion.discussion.documentId,
        discussionId: reply.discussionId,
        replyId,
        socketId,
    });

    return deletedDiscussion;
}