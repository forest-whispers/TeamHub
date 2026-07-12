import { ActivityEntityType, ActivityType, } from "@prisma/client";
import { eventBus } from "../../infrastructure/events/event-bus.js";
import { createActivity } from "./activity.service.js";

export function registerActivitySubscribers() {

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
    });
}