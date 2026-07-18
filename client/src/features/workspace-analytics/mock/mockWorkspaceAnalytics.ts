import type { WorkspaceAnalyticsData } from "../types"

const LATENCY = 500

const MOCK_DATA_7D: WorkspaceAnalyticsData = {
    metrics: {
        totalDocuments: {
            label: "Total Documents",
            value: 12,
            change: "+8.3%",
            trend: "up",
        },
        totalMembers: {
            label: "Total Members",
            value: 8,
            change: "0.0%",
            trend: "neutral",
        },
        totalFiles: {
            label: "Total Files",
            value: 24,
            change: "+14.2%",
            trend: "up",
        },
        recentActivity: {
            label: "Recent Activity",
            value: 142,
            change: "+24.5%",
            trend: "up",
        },
    },
    charts: {
        documentsCreated: [
            { label: "Mon", value: 2 },
            { label: "Tue", value: 1 },
            { label: "Wed", value: 4 },
            { label: "Thu", value: 0 },
            { label: "Fri", value: 3 },
            { label: "Sat", value: 1 },
            { label: "Sun", value: 1 },
        ],
        workspaceActivity: [
            { label: "Mon", value: 15 },
            { label: "Tue", value: 22 },
            { label: "Wed", value: 35 },
            { label: "Thu", value: 18 },
            { label: "Fri", value: 28 },
            { label: "Sat", value: 12 },
            { label: "Sun", value: 12 },
        ],
        fileUploads: [
            { label: "Mon", value: 3 },
            { label: "Tue", value: 5 },
            { label: "Wed", value: 2 },
            { label: "Thu", value: 4 },
            { label: "Fri", value: 6 },
            { label: "Sat", value: 1 },
            { label: "Sun", value: 3 },
        ],
    },
    insights: [
        {
            id: "ins-1",
            type: "member",
            label: "Most active member",
            value: "Alex Developer (42 contributions)",
            description: "Contributed 30% of all activity updates in this workspace over the last 7 days.",
        },
        {
            id: "ins-2",
            type: "document",
            label: "Most edited document",
            value: "API_Architecture_Guidelines.pdf",
            description: "Edited 18 times across 4 separate collaborative sessions.",
        },
        {
            id: "ins-3",
            type: "activity",
            label: "Most active day",
            value: "Wednesday",
            description: "Peak usage hour occurred at 2:00 PM with 35 activity log events.",
        },
    ],
}

const MOCK_DATA_30D: WorkspaceAnalyticsData = {
    metrics: {
        totalDocuments: {
            label: "Total Documents",
            value: 45,
            change: "+15.4%",
            trend: "up",
        },
        totalMembers: {
            label: "Total Members",
            value: 10,
            change: "+10.0%",
            trend: "up",
        },
        totalFiles: {
            label: "Total Files",
            value: 98,
            change: "+22.5%",
            trend: "up",
        },
        recentActivity: {
            label: "Recent Activity",
            value: 540,
            change: "+18.2%",
            trend: "up",
        },
    },
    charts: {
        documentsCreated: [
            { label: "Week 1", value: 8 },
            { label: "Week 2", value: 12 },
            { label: "Week 3", value: 15 },
            { label: "Week 4", value: 10 },
        ],
        workspaceActivity: [
            { label: "Week 1", value: 120 },
            { label: "Week 2", value: 145 },
            { label: "Week 3", value: 160 },
            { label: "Week 4", value: 115 },
        ],
        fileUploads: [
            { label: "Week 1", value: 20 },
            { label: "Week 2", value: 28 },
            { label: "Week 3", value: 30 },
            { label: "Week 4", value: 20 },
        ],
    },
    insights: [
        {
            id: "ins-1",
            type: "member",
            label: "Most active member",
            value: "Morgan Designer (156 contributions)",
            description: "Created and structured 8 layout files, updating assets regularly.",
        },
        {
            id: "ins-2",
            type: "document",
            label: "Most edited document",
            value: "landing_page_mockup.png",
            description: "Updated 42 times by 3 separate editors across several layout revisions.",
        },
        {
            id: "ins-3",
            type: "activity",
            label: "Most active day",
            value: "Thursdays (Avg 145 items)",
            description: "Thursdays consistently see high volume team sprint reviews and updates.",
        },
    ],
}

const MOCK_DATA_90D: WorkspaceAnalyticsData = {
    metrics: {
        totalDocuments: {
            label: "Total Documents",
            value: 120,
            change: "+35.2%",
            trend: "up",
        },
        totalMembers: {
            label: "Total Members",
            value: 15,
            change: "+25.0%",
            trend: "up",
        },
        totalFiles: {
            label: "Total Files",
            value: 240,
            change: "+40.3%",
            trend: "up",
        },
        recentActivity: {
            label: "Recent Activity",
            value: 1840,
            change: "-5.3%",
            trend: "down",
        },
    },
    charts: {
        documentsCreated: [
            { label: "Month 1", value: 35 },
            { label: "Month 2", value: 50 },
            { label: "Month 3", value: 35 },
        ],
        workspaceActivity: [
            { label: "Month 1", value: 580 },
            { label: "Month 2", value: 680 },
            { label: "Month 3", value: 580 },
        ],
        fileUploads: [
            { label: "Month 1", value: 70 },
            { label: "Month 2", value: 95 },
            { label: "Month 3", value: 75 },
        ],
    },
    insights: [
        {
            id: "ins-1",
            type: "member",
            label: "Most active member",
            value: "Alex Developer (512 contributions)",
            description: "Led development velocity metrics with critical code integrations.",
        },
        {
            id: "ins-2",
            type: "document",
            label: "Most edited document",
            value: "Database_Schema_Draft_v2.xlsx",
            description: "Document modified 152 times as team aligned on schema layouts.",
        },
        {
            id: "ins-3",
            type: "activity",
            label: "Most active day",
            value: "Tuesdays (Avg 180 items)",
            description: "Tuesday standups trigger high volume workflow assignments.",
        },
    ],
}

export async function getMockWorkspaceAnalytics(
    _workspaceId: string,
    timeRange: string
): Promise<WorkspaceAnalyticsData> {
    await new Promise((resolve) => setTimeout(resolve, LATENCY))

    if (localStorage.getItem("teamhub-mock-analytics-empty") === "true") {
        return {
            metrics: {
                totalDocuments: { label: "Total Documents", value: 0, change: "0.0%", trend: "neutral" },
                totalMembers: { label: "Total Members", value: 0, change: "0.0%", trend: "neutral" },
                totalFiles: { label: "Total Files", value: 0, change: "0.0%", trend: "neutral" },
                recentActivity: { label: "Recent Activity", value: 0, change: "0.0%", trend: "neutral" },
            },
            charts: {
                documentsCreated: [],
                workspaceActivity: [],
                fileUploads: [],
            },
            insights: [],
        }
    }

    if (localStorage.getItem("teamhub-mock-analytics-error") === "true") {
        throw new Error("Failed to load workspace analytics.")
    }

    switch (timeRange) {
        case "30d":
            return MOCK_DATA_30D
        case "90d":
            return MOCK_DATA_90D
        case "7d":
        default:
            return MOCK_DATA_7D
    }
}