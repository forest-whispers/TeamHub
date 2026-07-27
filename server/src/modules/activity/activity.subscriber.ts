import { ActivityEntityType, ActivityType, } from "@prisma/client";
import { eventBus } from "../../infrastructure/events/event-bus.js";
import { getIO } from "../../infrastructure/websocket/socket.js";

import { createActivity } from "./activity.service.js";

function broadcastActivity( workspaceId: string, activity: unknown) {
    getIO()
        .to(`workspace:${workspaceId}`)
        .emit("activity:new", {
            activity,
        });
}

export function registerActivitySubscribers() {

    eventBus.on("workspace.member.joined", async (event) => {
        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.WORKSPACE_MEMBER_JOINED,

            entityType: ActivityEntityType.USER,
            entityId: event.memberId,

            metadata: {
                memberName: event.memberName,
            },
        });

        console.log("[ACTIVITY] workspace.member.joined", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
            activity,
        });
    });

    eventBus.on("workspace.member.left", async (event) => {
        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.WORKSPACE_MEMBER_LEFT,

            entityType: ActivityEntityType.USER,
            entityId: event.memberId,

            metadata: {
                memberName: event.memberName,
            },
        });

        console.log("[ACTIVITY] workspace.member.left", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
            activity,
        });
    });

    eventBus.on("workspace.member.role_changed", async (event) => {
        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.MEMBER_ROLE,

            entityType: ActivityEntityType.MEMBER,
            entityId: event.memberId,

            metadata: {
                memberName: event.memberName,
                oldRole: event.oldRole,
                newRole: event.newRole,
            },
        });

        console.log("[ACTIVITY] workspace.member.role_changed", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
            activity,
        });
    });

    eventBus.on("document.created", async (event) => {
        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.DOCUMENT_CREATED,

            entityType: ActivityEntityType.DOCUMENT,
            entityId: event.documentId,

            metadata: {
                title: event.title,
            },
        });

        console.log("[ACTIVITY] document.created", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
                activity,
            });
    });

    eventBus.on("document.renamed", async (event) => {
        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.DOCUMENT_RENAMED,

            entityType: ActivityEntityType.DOCUMENT,
            entityId: event.documentId,

            metadata: {
                oldTitle: event.oldTitle,
                newTitle: event.newTitle,
            },
        });

        console.log("[ACTIVITY] document.renamed", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
                activity,
            });
    });

    eventBus.on("document.deleted", async (event) => {
        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.DOCUMENT_DELETED,

            entityType: ActivityEntityType.DOCUMENT,
            entityId: event.documentId,

            metadata: {
                title: event.title,
            },
        });

        console.log("[ACTIVITY] document.deleted", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
                activity,
            });
    });

    eventBus.on("file.created", async (event) => {

        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.FILE_CREATED,

            entityType: ActivityEntityType.FILE,
            entityId: event.fileId,

            metadata: {
                displayName: event.displayName,
                originalName: event.originalName,
                size: event.size,
            },
        });

        console.log("[ACTIVITY] file.created", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
                activity,
            });
    });

    eventBus.on("file.renamed", async (event) => {

        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.FILE_RENAMED,

            entityType: ActivityEntityType.FILE,
            entityId: event.fileId,

            metadata: {
                oldDisplayName: event.oldDisplayName,
                newDisplayName: event.newDisplayName,
            },
        });

        console.log("[ACTIVITY] file.renamed", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
                activity,
            });
    });

    eventBus.on("file.deleted", async (event) => {

        const activity = await createActivity({
            workspaceId: event.workspaceId,
            actorId: event.actorId,

            type: ActivityType.FILE_DELETED,

            entityType: ActivityEntityType.FILE,
            entityId: event.fileId,

            metadata: {
                displayName: event.displayName,
            },
        });

        console.log("[ACTIVITY] file.deleted", activity);

        getIO().to(`workspace:${event.workspaceId}`).emit("activity:new", {
                activity,
            });
    });
}