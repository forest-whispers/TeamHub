import type { ActivityEntityType, ActivityType, Prisma } from "@prisma/client";

export interface CreateActivityInput {
    workspaceId: string;
    actorId: string | null;

    type: ActivityType;

    entityType: ActivityEntityType;
    entityId?: string | null;

    metadata?: Prisma.InputJsonValue;
}

export interface GetActivitiesQuery {
    cursor?: string;
    limit?: number;
}