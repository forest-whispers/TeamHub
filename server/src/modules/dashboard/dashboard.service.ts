import { prisma } from "../../lib/prisma.js";
import type { DashboardResponseDto } from "./dashboard.types.js";

export const getDashboardData = async (userId: string): Promise<DashboardResponseDto> => {
    // 1. Fetch user's workspace memberships to get workspaceIds
    const memberships = await prisma.workspaceMember.findMany({
        where: { userId },
        select: { workspaceId: true },
    });

    const workspaceIds = memberships.map((m: { workspaceId: string }) => m.workspaceId);

    if (workspaceIds.length === 0) {
        return {
            continueWorking: null,
            recentActivity: [],
            workspaces: [],
            overview: {
                totalWorkspaces: 0,
                totalDocuments: 0,
                totalFiles: 0,
                totalMembers: 0,
            },
        };
    }

    // 2. Fetch the components concurrently using Promise.all
    const [
        continueWorkingDoc,
        recentActivities,
        workspaceDetails,
        totalDocuments,
        totalFiles,
        totalMembers,
    ] = await Promise.all([
        // Continue Working: The most recently updated document available to the user in their workspaces
        prisma.document.findFirst({
            where: {
                workspaceId: { in: workspaceIds },
            },
            orderBy: {
                updatedAt: "desc",
            },
            select: {
                id: true,
                title: true,
                workspaceId: true,
                workspace: {
                    select: {
                        name: true,
                    },
                },
                updatedAt: true,
            },
        }),

        // Recent Activity: The latest workspace activity across all user's workspaces
        prisma.activity.findMany({
            where: {
                workspaceId: { in: workspaceIds },
            },
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" },
            ],
            take: 15,
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
        }),

        // Workspace Cards: Enough details to render the dashboard workspace listing
        prisma.workspace.findMany({
            where: {
                id: { in: workspaceIds },
            },
            select: {
                id: true,
                name: true,
                description: true,
                owner: {
                    select: {
                        email: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        documents: true,
                        files: true,
                    },
                },
                activities: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                    select: {
                        createdAt: true,
                    },
                },
            },
        }),

        // Global Documents Count
        prisma.document.count({
            where: {
                workspaceId: { in: workspaceIds },
            },
        }),

        // Global Files Count
        prisma.file.count({
            where: {
                workspaceId: { in: workspaceIds },
            },
        }),

        // Global Members Count
        prisma.workspaceMember.count({
            where: {
                workspaceId: { in: workspaceIds },
            },
        }),
    ]);

    // 3. Format/aggregate retrieved data into DTOs
    const continueWorking = continueWorkingDoc
        ? {
              id: continueWorkingDoc.id,
              title: continueWorkingDoc.title,
              workspaceId: continueWorkingDoc.workspaceId,
              workspaceName: continueWorkingDoc.workspace.name,
              updatedAt: continueWorkingDoc.updatedAt.toISOString(),
          }
        : null;

    const recentActivity = recentActivities.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        entityType: activity.entityType,
        entityId: activity.entityId,
        metadata: activity.metadata,
        workspaceId: activity.workspaceId,
        createdAt: activity.createdAt.toISOString(),
        actor: activity.actor,
    }));

    const workspaces = workspaceDetails.map((w: any) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        memberCount: w._count.members,
        documentCount: w._count.documents,
        fileCount: w._count.files,
        lastActivityAt: w.activities[0]?.createdAt.toISOString() ?? null,
        adminEmail: w.owner.email,
    }));

    const overview = {
        totalWorkspaces: workspaceIds.length,
        totalDocuments,
        totalFiles,
        totalMembers,
    };

    return {
        overview,
        continueWorking,
        recentActivity,
        workspaces,
    };
};