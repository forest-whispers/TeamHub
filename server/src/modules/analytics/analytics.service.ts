import { prisma } from "../../lib/prisma.js";
import type { WorkspaceAnalyticsData, InsightItem } from "./analytics.types.js";

export async function getWorkspaceAnalytics(
    workspaceId: string
): Promise<WorkspaceAnalyticsData> {
    // Start of the 7-day range (6 days ago at 00:00:00)
    const now = new Date();
    const startOfRange = new Date();
    startOfRange.setDate(now.getDate() - 6);
    startOfRange.setHours(0, 0, 0, 0);

    // 1. Fetch counts, lists, and group aggregates concurrently
    const [
        totalDocuments,
        totalFiles,
        totalActivities,
        members,
        recentDocuments,
        recentActivities,
        recentFiles,
        mostActiveMemberGroup,
        topDocuments
    ] = await Promise.all([
        prisma.document.count({ where: { workspaceId } }),
        prisma.file.count({ where: { workspaceId } }),
        prisma.activity.count({ where: { workspaceId } }),
        prisma.workspaceMember.findMany({
            where: { workspaceId },
            select: {
                userId: true,
                user: {
                    select: { name: true }
                }
            }
        }),
        prisma.document.findMany({
            where: { workspaceId, createdAt: { gte: startOfRange } },
            select: { createdAt: true }
        }),
        prisma.activity.findMany({
            where: { workspaceId, createdAt: { gte: startOfRange } },
            select: { createdAt: true }
        }),
        prisma.file.findMany({
            where: { workspaceId, createdAt: { gte: startOfRange } },
            select: { createdAt: true }
        }),
        prisma.activity.groupBy({
            by: ['actorId'],
            where: { workspaceId, actorId: { not: null } },
            _count: { id: true },
            _max: { createdAt: true },
            orderBy: [
                { _count: { id: 'desc' } },
                { _max: { createdAt: 'desc' } }
            ],
            take: 1
        }),
        prisma.document.findMany({
            where: { workspaceId },
            select: {
                id: true,
                title: true,
                updatedAt: true,
                _count: {
                    select: { snapshots: true }
                }
            },
            orderBy: [
                {
                    snapshots: {
                        _count: 'desc'
                    }
                },
                {
                    updatedAt: 'desc'
                }
            ],
            take: 1
        })
    ]);

    // 2. Format chronological weekdays order: Mon -> Sun
    const weekdaysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekdaysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const getWeekdayLabel = (date: Date): string => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[date.getDay()];
    };

    // Initialize counts maps
    const docsMap = new Map<string, number>(weekdaysOrder.map(w => [w, 0]));
    const actMap = new Map<string, number>(weekdaysOrder.map(w => [w, 0]));
    const filesMap = new Map<string, number>(weekdaysOrder.map(w => [w, 0]));

    // Populate maps
    recentDocuments.forEach(doc => {
        const label = getWeekdayLabel(doc.createdAt);
        if (docsMap.has(label)) {
            docsMap.set(label, docsMap.get(label)! + 1);
        }
    });

    recentActivities.forEach(act => {
        const label = getWeekdayLabel(act.createdAt);
        if (actMap.has(label)) {
            actMap.set(label, actMap.get(label)! + 1);
        }
    });

    recentFiles.forEach(file => {
        const label = getWeekdayLabel(file.createdAt);
        if (filesMap.has(label)) {
            filesMap.set(label, filesMap.get(label)! + 1);
        }
    });

    // Build the final response arrays (always ordered Mon -> Sun)
    const documentsCreated = weekdaysOrder.map(label => ({
        label,
        value: docsMap.get(label) || 0
    }));

    const workspaceActivity = weekdaysOrder.map(label => ({
        label,
        value: actMap.get(label) || 0
    }));

    const fileUploads = weekdaysOrder.map(label => ({
        label,
        value: filesMap.get(label) || 0
    }));

    // 3. Compute insights
    const insights: InsightItem[] = [];

    // Most Active Member
    if (mostActiveMemberGroup.length > 0 && mostActiveMemberGroup[0]!.actorId) {
        const actorId = mostActiveMemberGroup[0]!.actorId;
        const member = members.find(m => m.userId === actorId);
        if (member) {
            insights.push({
                id: "ins-member",
                type: "member",
                label: "Most active member",
                value: `${member.user.name} (${mostActiveMemberGroup[0]!._count.id} contributions)`,
                description: "Most active contributor in this workspace over the last 7 days."
            });
        }
    }

    // Most Edited Document
    if (topDocuments.length > 0 && topDocuments[0]!._count.snapshots > 0) {
        insights.push({
            id: "ins-document",
            type: "document",
            label: "Most edited document",
            value: topDocuments[0]!.title,
            description: `Edited ${topDocuments[0]!._count.snapshots} times across collaborative sessions.`
        });
    }

    // Most Active Day
    let maxActivityCount = -1;
    let peakDayName: string | null = null;

    // Get last 7 days starting from today going backwards to break ties with the most recent day
    const last7DaysReverse: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7DaysReverse.push(d);
    }

    last7DaysReverse.forEach(d => {
        const label = getWeekdayLabel(d);
        const count = actMap.get(label) || 0;
        if (count > maxActivityCount) {
            maxActivityCount = count;
            peakDayName = weekdaysFull[d.getDay()];
        }
    });

    if (recentActivities.length > 0 && peakDayName) {
        insights.push({
            id: "ins-activity",
            type: "activity",
            label: "Most active day",
            value: peakDayName,
            description: `Peak usage day with ${maxActivityCount} activity log events.`
        });
    }

    return {
        metrics: {
            totalDocuments: {
                label: "Total Documents",
                value: totalDocuments,
                change: "",
                trend: "neutral"
            },
            totalMembers: {
                label: "Total Members",
                value: members.length,
                change: "",
                trend: "neutral"
            },
            totalFiles: {
                label: "Total Files",
                value: totalFiles,
                change: "",
                trend: "neutral"
            },
            recentActivity: {
                label: "Recent Activity",
                value: totalActivities,
                change: "",
                trend: "neutral"
            }
        },
        charts: {
            documentsCreated,
            workspaceActivity,
            fileUploads
        },
        insights
    };
}