import type { RecentDocument, Workspace, ActivityItem } from "../types"

// Latency presets for debugging loading states
const LATENCY = 600

export async function getMockContinueWorking(): Promise<RecentDocument | null> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  // Allow forcing empty state via local storage
  if (localStorage.getItem("teamhub-mock-dashboard-empty") === "true") {
    return null
  }

  // Allow forcing error state via local storage
  if (localStorage.getItem("teamhub-mock-dashboard-error-continue") === "true") {
    throw new Error("Failed to fetch recently opened document.")
  }

  return {
    id: "doc-1",
    name: "API Architecture Guidelines",
    workspaceId: "ws-1",
    workspaceName: "Engineering Team",
    lastOpened: "2 hours ago",
  }
}

export async function getMockWorkspaces(): Promise<Workspace[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY + 100))

  if (localStorage.getItem("teamhub-mock-dashboard-empty") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-dashboard-error-workspaces") === "true") {
    throw new Error("Failed to load workspace list.")
  }

  return [
    {
      id: "ws-1",
      name: "Engineering Team",
      description: "Core engineering specifications, roadmap, and development guides.",
      memberCount: 12,
      documentCount: 24,
      lastActivity: "10 minutes ago",
    },
    {
      id: "ws-2",
      name: "Product Launch 2026",
      description: "Cross-functional workspace for marketing, feedback, and tracking launch deliverables.",
      memberCount: 8,
      documentCount: 5,
      lastActivity: "3 hours ago",
    },
    {
      id: "ws-3",
      name: "Customer Feedback",
      description: "Aggregated tickets, focus group notes, and analysis reports.",
      memberCount: 5,
      documentCount: 12,
      lastActivity: "1 day ago",
    },
  ]
}

export async function getMockRecentActivity(): Promise<ActivityItem[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY + 200))

  if (localStorage.getItem("teamhub-mock-dashboard-empty") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-dashboard-error-activity") === "true") {
    throw new Error("Failed to load recent activity feed.")
  }

  return [
    {
      id: "act-1",
      actor: "Alex Developer",
      action: "updated",
      target: "API Architecture Guidelines",
      timestamp: "5 minutes ago",
    },
    {
      id: "act-2",
      actor: "Jamie Product",
      action: "created document",
      target: "Launch Roadmap",
      timestamp: "2 hours ago",
    },
    {
      id: "act-3",
      actor: "Taylor Support",
      action: "joined workspace",
      target: "Customer Feedback",
      timestamp: "4 hours ago",
    },
    {
      id: "act-4",
      actor: "Alex Developer",
      action: "edited document",
      target: "Database Schema",
      timestamp: "1 day ago",
    },
  ]
}
