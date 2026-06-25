import type { WorkspaceSummary, RecentDocument, RecentActivity, WorkspaceMember } from "../types"

const LATENCY = 550

export async function getMockWorkspaceSummary(workspaceId: string): Promise<WorkspaceSummary> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-home-error-summary") === "true") {
    throw new Error("Failed to load workspace summary.")
  }

  // Workspaces info matching Dashboard list
  const workspaces = [
    {
      id: "ws-1",
      name: "Engineering Team",
      description: "Core engineering specifications, roadmap, and development guides.",
      memberCount: 12,
      onlineCount: 4,
    },
    {
      id: "ws-2",
      name: "Product Launch 2026",
      description: "Cross-functional workspace for marketing, feedback, and tracking launch deliverables.",
      memberCount: 8,
      onlineCount: 2,
    },
    {
      id: "ws-3",
      name: "Customer Feedback",
      description: "Aggregated tickets, focus group notes, and analysis reports.",
      memberCount: 5,
      onlineCount: 1,
    },
  ]

  const match = workspaces.find((w) => w.id === workspaceId)

  return (
    match || {
      id: workspaceId,
      name: "Team Workspace",
      description: "Collaborative workspace for task planning, notes, and asset sharing.",
      memberCount: 6,
      onlineCount: 3,
    }
  )
}

export async function getMockRecentDocuments(_workspaceId: string): Promise<RecentDocument[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY + 100))

  if (localStorage.getItem("teamhub-mock-home-empty-documents") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-home-error-documents") === "true") {
    throw new Error("Failed to load recent documents.")
  }

  return [
    {
      id: "doc-1",
      name: "API Architecture Guidelines",
      lastEdited: "2 hours ago",
      lastEditedBy: "Alex Developer",
    },
    {
      id: "doc-2",
      name: "Database Schema Draft",
      lastEdited: "Yesterday",
      lastEditedBy: "Jamie Product",
    },
    {
      id: "doc-3",
      name: "Release Checklist v1.2",
      lastEdited: "3 days ago",
      lastEditedBy: "Taylor Support",
    },
  ]
}

export async function getMockRecentActivity(_workspaceId: string): Promise<RecentActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY + 150))

  if (localStorage.getItem("teamhub-mock-home-empty-activity") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-home-error-activity") === "true") {
    throw new Error("Failed to load recent activity.")
  }

  return [
    {
      id: "act-1",
      actor: "Alex Developer",
      action: "updated document",
      target: "API Architecture Guidelines",
      timestamp: "10 minutes ago",
    },
    {
      id: "act-2",
      actor: "Jamie Product",
      action: "created document",
      target: "Database Schema Draft",
      timestamp: "2 hours ago",
    },
    {
      id: "act-3",
      actor: "Taylor Support",
      action: "added comment to",
      target: "Release Checklist v1.2",
      timestamp: "1 day ago",
    },
  ]
}

export async function getMockWorkspaceMembers(_workspaceId: string): Promise<WorkspaceMember[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY + 200))

  if (localStorage.getItem("teamhub-mock-home-empty-members") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-home-error-members") === "true") {
    throw new Error("Failed to load workspace members.")
  }

  return [
    {
      id: "mem-1",
      name: "Alex Developer",
      role: "Owner",
      status: "online",
    },
    {
      id: "mem-2",
      name: "Jamie Product",
      role: "Product Manager",
      status: "online",
    },
    {
      id: "mem-3",
      name: "Taylor Support",
      role: "Support Lead",
      status: "away",
    },
    {
      id: "mem-4",
      name: "Morgan Designer",
      role: "UI Designer",
      status: "offline",
    },
  ]
}
