import type { CreateWorkspaceData } from "../types"

/**
 * Simulates a mock workspace creation backend endpoint.
 * Throws a mock error if the workspace name is "Error Workspace".
 */
export async function mockCreateWorkspace(workspaceData: CreateWorkspaceData): Promise<any> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 700))

  if (workspaceData.name.toLowerCase() === "error workspace") {
    throw new Error("Workspace name is already taken")
  }

  return {
    id: `ws-${Math.random().toString(36).substring(2, 9)}`,
    name: workspaceData.name,
    description: workspaceData.description || "",
    accentColor: workspaceData.accentColor,
    memberCount: 1,
    documentCount: 0,
    lastActivity: "Just now",
  }
}

/**
 * Simulates a mock join workspace backend endpoint.
 * Throws a mock error if the join code matches "ERROR".
 */
export async function mockJoinWorkspace(joinCode: string): Promise<any> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 700))

  if (joinCode.toUpperCase() === "ERROR") {
    throw new Error("Invalid join code or workspace does not exist")
  }

  return {
    id: `ws-${Math.random().toString(36).substring(2, 9)}`,
    name: "Joined Team Workspace",
    description: "Successfully joined collaborative workspace using access code.",
    accentColor: "blue",
    memberCount: 5,
    documentCount: 8,
    lastActivity: "Just now",
  }
}
