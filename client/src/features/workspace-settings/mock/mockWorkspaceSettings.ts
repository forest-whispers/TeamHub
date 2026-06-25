import type { WorkspaceSettings } from "../types"

const LATENCY = 500

const mockSettingsStore: Record<string, WorkspaceSettings> = {
  "ws-1": {
    name: "Engineering Team",
    description: "Collaboration workspace for the core engineering team working on TeamHub features.",
    accentColor: "blue",
    totalMembers: 8,
    owner: "Alex Developer",
    defaultHomePage: "home",
    compactMode: false,
    enableNotifications: true,
  },
  "ws-2": {
    name: "Marketing Launch",
    description: "Workspace focused on marketing campaigns, launch reviews, and statistics analytics.",
    accentColor: "violet",
    totalMembers: 3,
    owner: "Jamie Product",
    defaultHomePage: "documents",
    compactMode: true,
    enableNotifications: false,
  },
}

export async function getMockWorkspaceSettings(workspaceId: string): Promise<WorkspaceSettings> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-settings-empty") === "true") {
    return {
      name: "",
      description: "",
      accentColor: "blue",
      totalMembers: 0,
      owner: "",
      defaultHomePage: "home",
      compactMode: false,
      enableNotifications: false,
    }
  }

  if (localStorage.getItem("teamhub-mock-settings-error") === "true") {
    throw new Error("Failed to load workspace settings.")
  }

  const settings = mockSettingsStore[workspaceId] || mockSettingsStore["ws-1"]
  // Return deep copy to prevent mutation side-effects outside of updates
  return { ...settings }
}

export async function updateMockWorkspaceSettings(
  workspaceId: string,
  settings: Partial<WorkspaceSettings>
): Promise<WorkspaceSettings> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-settings-error") === "true") {
    throw new Error("Failed to update workspace settings.")
  }

  const key = mockSettingsStore[workspaceId] ? workspaceId : "ws-1"
  const existing = mockSettingsStore[key]
  const updated = { ...existing, ...settings }

  mockSettingsStore[key] = updated
  return { ...updated }
}
