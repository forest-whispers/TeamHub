import type { WorkspaceActivityItem } from "../types"

const LATENCY = 500

const MOCK_ACTIVITY: Record<string, WorkspaceActivityItem[]> = {
  "ws-1": [
    {
      id: "act-1",
      actor: "Alex Developer",
      action: "updated document",
      target: "API Architecture Guidelines",
      timestamp: "10 minutes ago",
      type: "document",
    },
    {
      id: "act-2",
      actor: "Jamie Product",
      action: "created document",
      target: "Database Schema Draft",
      timestamp: "2 hours ago",
      type: "document",
    },
    {
      id: "act-3",
      actor: "Taylor Support",
      action: "added comment to",
      target: "Release Checklist v1.2",
      timestamp: "1 day ago",
      type: "comment",
    },
    {
      id: "act-4",
      actor: "Alex Developer",
      action: "updated document",
      target: "Marketing Strategy 2026",
      timestamp: "1 day ago",
      type: "document",
    },
    {
      id: "act-5",
      actor: "Jamie Product",
      action: "invited",
      target: "Casey Coder",
      timestamp: "2 days ago",
      type: "member",
    },
    {
      id: "act-6",
      actor: "Morgan Designer",
      action: "uploaded attachment to",
      target: "Figma Mockup Board",
      timestamp: "3 days ago",
      type: "document",
    },
    {
      id: "act-7",
      actor: "Taylor Support",
      action: "resolved comment in",
      target: "FAQ Troubleshooting Guide",
      timestamp: "4 days ago",
      type: "comment",
    },
    {
      id: "act-8",
      actor: "Alex Developer",
      action: "updated settings in",
      target: "Engineering Team Workspace",
      timestamp: "5 days ago",
      type: "workspace",
    },
  ],
  "ws-2": [
    {
      id: "act-101",
      actor: "Jamie Product",
      action: "updated document",
      target: "Marketing Strategy 2026",
      timestamp: "4 hours ago",
      type: "document",
    },
    {
      id: "act-102",
      actor: "Alex Developer",
      action: "created document",
      target: "Launch Plan Roadmap",
      timestamp: "3 days ago",
      type: "document",
    },
    {
      id: "act-103",
      actor: "Jamie Product",
      action: "invited",
      target: "Morgan Designer",
      timestamp: "4 days ago",
      type: "member",
    },
  ],
}

export async function getMockWorkspaceActivity(workspaceId: string): Promise<WorkspaceActivityItem[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-activity-empty") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-activity-error") === "true") {
    throw new Error("Failed to load workspace activities.")
  }

  return MOCK_ACTIVITY[workspaceId] || MOCK_ACTIVITY["ws-1"]
}
