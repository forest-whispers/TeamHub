import { eventBus } from "../../infrastructure/events/event-bus.js";
import { getIO } from "../../infrastructure/websocket/socket.js";
import { prisma } from "../../lib/prisma.js";
import { NotificationType, NotificationEntityType } from "@prisma/client";
import { serializeNotification } from "./notification.service.js";

export function registerNotificationSubscribers() {
    // 1. chat.message.mentioned
    eventBus.on("chat.message.mentioned", async (event) => {
        if (event.recipientId === event.actorId) {
            return;
        }

        const message = await prisma.chatMessage.findUnique({
            where: { id: event.messageId },
            select: { content: true }
        });

        const notification = await prisma.notification.create({
            data: {
                recipientId: event.recipientId,
                actorId: event.actorId,
                workspaceId: event.workspaceId,
                type: NotificationType.CHAT_MENTION,
                entityType: NotificationEntityType.CHAT_MESSAGE,
                entityId: event.messageId,
                metadata: {
                    documentId: event.documentId,
                    messageContent: message?.content || "",
                }
            },
            include: {
                actor: { select: { id: true, name: true, avatar: true } },
                workspace: { select: { id: true, name: true } }
            }
        });

        const serialized = serializeNotification(notification);
        getIO().to(`notifications:${event.recipientId}`).emit("notification:new", serialized);
    });

    // 2. discussion.mentioned
    eventBus.on("discussion.mentioned", async (event) => {
        if (event.recipientId === event.actorId) {
            return;
        }

        const discussion = await prisma.documentDiscussion.findUnique({
            where: { id: event.discussionId },
            select: {
                quotedText: true,
                replies: {
                    orderBy: { createdAt: "asc" },
                    take: 1,
                    select: { message: true }
                }
            }
        });

        const firstReply = discussion?.replies[0];
        const messageContent = firstReply?.message || "";

        const notification = await prisma.notification.create({
            data: {
                recipientId: event.recipientId,
                actorId: event.actorId,
                workspaceId: event.workspaceId,
                type: NotificationType.DISCUSSION_MENTION,
                entityType: NotificationEntityType.DISCUSSION,
                entityId: event.discussionId,
                metadata: {
                    documentId: event.documentId,
                    messageContent,
                    quotedText: discussion?.quotedText || "",
                }
            },
            include: {
                actor: { select: { id: true, name: true, avatar: true } },
                workspace: { select: { id: true, name: true } }
            }
        });

        const serialized = serializeNotification(notification);
        getIO().to(`notifications:${event.recipientId}`).emit("notification:new", serialized);
    });

    // 3. discussion.replied
    eventBus.on("discussion.replied", async (event) => {
        if (event.recipientId === event.actorId) {
            return;
        }

        const lastReply = await prisma.documentDiscussionReply.findFirst({
            where: { discussionId: event.discussionId },
            orderBy: { createdAt: "desc" },
            select: { message: true }
        });

        const notification = await prisma.notification.create({
            data: {
                recipientId: event.recipientId,
                actorId: event.actorId,
                workspaceId: event.workspaceId,
                type: NotificationType.DISCUSSION_REPLY,
                entityType: NotificationEntityType.DISCUSSION,
                entityId: event.discussionId,
                metadata: {
                    documentId: event.documentId,
                    messageContent: lastReply?.message || "",
                }
            },
            include: {
                actor: { select: { id: true, name: true, avatar: true } },
                workspace: { select: { id: true, name: true } }
            }
        });

        const serialized = serializeNotification(notification);
        getIO().to(`notifications:${event.recipientId}`).emit("notification:new", serialized);
    });

    // 4. discussion.resolved
    eventBus.on("discussion.resolved", async (event) => {
        if (event.recipientId === event.actorId) {
            return;
        }

        const discussion = await prisma.documentDiscussion.findUnique({
            where: { id: event.discussionId },
            select: { quotedText: true }
        });

        const notification = await prisma.notification.create({
            data: {
                recipientId: event.recipientId,
                actorId: event.actorId,
                workspaceId: event.workspaceId,
                type: NotificationType.DISCUSSION_RESOLVED,
                entityType: NotificationEntityType.DISCUSSION,
                entityId: event.discussionId,
                metadata: {
                    documentId: event.documentId,
                    quotedText: discussion?.quotedText || "",
                }
            },
            include: {
                actor: { select: { id: true, name: true, avatar: true } },
                workspace: { select: { id: true, name: true } }
            }
        });

        const serialized = serializeNotification(notification);
        getIO().to(`notifications:${event.recipientId}`).emit("notification:new", serialized);
    });

    // 5. workspace.member.role_changed
    eventBus.on("workspace.member.role_changed", async (event) => {
        if (event.memberId === event.actorId) {
            return;
        }

        const notification = await prisma.notification.create({
            data: {
                recipientId: event.memberId,
                actorId: event.actorId,
                workspaceId: event.workspaceId,
                type: NotificationType.WORKSPACE_ROLE_CHANGED,
                entityType: NotificationEntityType.WORKSPACE,
                entityId: event.workspaceId,
                metadata: {
                    oldRole: event.oldRole,
                    newRole: event.newRole,
                }
            },
            include: {
                actor: { select: { id: true, name: true, avatar: true } },
                workspace: { select: { id: true, name: true } }
            }
        });

        const serialized = serializeNotification(notification);
        getIO().to(`notifications:${event.memberId}`).emit("notification:new", serialized);
    });

    // 6. workspace.removed
    eventBus.on("workspace.removed", async (event) => {
        if (event.recipientId === event.actorId) {
            return;
        }

        const notification = await prisma.notification.create({
            data: {
                recipientId: event.recipientId,
                actorId: event.actorId,
                workspaceId: null,
                type: NotificationType.WORKSPACE_REMOVED,
                entityType: NotificationEntityType.WORKSPACE,
                entityId: event.workspaceId,
                metadata: {
                    workspaceName: event.workspaceName,
                }
            },
            include: {
                actor: { select: { id: true, name: true, avatar: true } }
            }
        });

        const serialized = serializeNotification(notification);
        getIO().to(`notifications:${event.recipientId}`).emit("notification:new", serialized);
    });
}