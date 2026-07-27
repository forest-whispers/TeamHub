import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../../shared/errors/index.js";
import type { GetNotificationsQuery } from "./notification.types.js";

export function serializeNotification(notification: any) {
    const actorName = notification.actor?.name || "Someone";
    const workspaceName = notification.workspace?.name || "workspace";
    const metadata = (notification.metadata as Record<string, any>) || {};

    let title = "";
    let description = "";

    switch (notification.type) {
        case "CHAT_MENTION":
            title = `${actorName} mentioned you in chat`;
            description = metadata.messageContent || "No message content";
            break;
        case "DISCUSSION_MENTION":
            title = `${actorName} mentioned you in a discussion`;
            description = metadata.messageContent || "No discussion content";
            break;
        case "DISCUSSION_REPLY":
            title = `${actorName} replied to your discussion`;
            description = metadata.messageContent || "No reply content";
            break;
        case "DISCUSSION_RESOLVED":
            title = `${actorName} resolved a discussion`;
            description = metadata.quotedText ? `"${metadata.quotedText}"` : "The discussion has been marked as resolved";
            break;
        case "WORKSPACE_ROLE_CHANGED":
            title = `Role updated in ${workspaceName}`;
            const role = metadata.newRole ? metadata.newRole.toLowerCase() : "member";
            description = `Your role has been changed to ${role}`;
            break;
        case "WORKSPACE_REMOVED":
            title = `Workspace removed`;
            description = `The workspace "${metadata.workspaceName || workspaceName}" has been deleted`;
            break;
        default:
            title = "New Notification";
            description = "You have a new update";
    }

    return {
        id: notification.id,
        type: notification.type,
        title,
        description,
        isRead: notification.read,
        createdAt: notification.createdAt.toISOString(),
        actor: notification.actor ? {
            name: notification.actor.name,
            avatarUrl: notification.actor.avatar,
        } : undefined,
        metadata: {
            ...metadata,
            workspaceId: notification.workspaceId,
        },
    };
}

export async function getNotifications(
    userId: string,
    query: GetNotificationsQuery
) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);

    const notifications = await prisma.notification.findMany({
        where: {
            recipientId: userId,
        },
        orderBy: [
            {
                createdAt: "desc",
            },
            {
                id: "desc",
            },
        ],
        take: limit + 1,
        ...(query.cursor && {
            cursor: {
                id: query.cursor,
            },
            skip: 1,
        }),
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
            workspace: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    const hasMore = notifications.length > limit;
    if (hasMore) {
        notifications.pop();
    }

    const nextCursor = hasMore && notifications.length > 0 ? notifications[notifications.length - 1]!.id : null;

    return {
        notifications,
        nextCursor,
        hasMore,
    };
}

export async function markNotificationRead(
    userId: string,
    notificationId: string
) {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
    });

    if (!notification) {
        throw new NotFoundError("Notification not found");
    }

    if (notification.recipientId !== userId) {
        throw new ForbiddenError("Not authorized to read this notification");
    }

    return prisma.notification.update({
        where: { id: notificationId },
        data: {
            read: true,
            readAt: new Date(),
        },
        include: {
            actor: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
            workspace: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}

export async function markAllNotificationsRead(userId: string) {
    await prisma.notification.updateMany({
        where: {
            recipientId: userId,
            read: false,
        },
        data: {
            read: true,
            readAt: new Date(),
        },
    });
}