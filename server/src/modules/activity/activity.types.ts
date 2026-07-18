import type { ActivityEntityType, ActivityType, Prisma } from "@prisma/client";
import type { createActivity } from "./activity.service.js";


export interface CreateActivityInput {
    workspaceId: string;
    actorId: string | null;

    type: ActivityType;

    entityType: ActivityEntityType;
    entityId?: string | null;

    metadata?: Prisma.InputJsonValue;
}

export type ActivityPayload = Awaited<
    ReturnType<typeof createActivity>
>;

export interface GetActivitiesQuery {
    cursor?: string;
    limit?: number;
}