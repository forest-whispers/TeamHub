import { prisma } from "../../lib/prisma.js";
import { Prisma } from "@prisma/client";
import type { CreateActivityInput, GetActivitiesQuery } from "./activity.types.js";
import { ensureWorkspaceMember } from "../../shared/authorization/workspace.js";

export async function queryWorkspaceActivities(
    workspaceId: string,
    query: GetActivitiesQuery,
) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);

    return prisma.activity.findMany({
        where: {
            workspaceId,
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

        select: {
            id: true,
            type: true,
            entityType: true,
            entityId: true,
            metadata: true,
            workspaceId: true,
            createdAt: true,

            actor: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });
}

export async function createActivity(
    data: CreateActivityInput
) {
    return prisma.activity.create({
        data: {
            workspaceId: data.workspaceId,
            actorId: data.actorId,

            type: data.type,

            entityType: data.entityType,
            entityId: data.entityId ?? null,

            metadata: data.metadata ?? Prisma.DbNull,
        },

        select: {
            id: true,
            type: true,
            entityType: true,
            entityId: true,
            metadata: true,
            workspaceId: true,
            createdAt: true,

            actor: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    });
}

export async function getWorkspaceActivities(
    requesterId: string,
    workspaceId: string,
    query: GetActivitiesQuery
) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    const limit = Math.min( Math.max(query.limit ?? 20, 1), 50 );

    const activities = await queryWorkspaceActivities(workspaceId, query);

    const hasMore = activities.length > limit;

    if (hasMore) {
        activities.pop();
    }

    const nextCursor = hasMore && activities.length > 0 ? activities[activities.length - 1]!.id : null;

    return {
        activities,
        nextCursor,
        hasMore,
    };
}