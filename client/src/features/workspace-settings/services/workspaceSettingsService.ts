import api from "@/shared/lib/api"
import type { WorkspaceSettings } from "../types"

export const workspaceSettingsService = {
  getWorkspaceSettings: async (workspaceId: string): Promise<WorkspaceSettings> => {
    const response = await api.get(`/workspaces/${workspaceId}`)
    const data = response.data
    const ownerMember = data.members?.find((m: any) => m.id === data.ownerId)

    const defaultHomePage = localStorage.getItem(`workspace-pref-home-${workspaceId}`) || "home"
    const compactMode = localStorage.getItem(`workspace-pref-compact-${workspaceId}`) === "true"
    const enableNotifications = localStorage.getItem(`workspace-pref-notify-${workspaceId}`) !== "false"

    return {
      name: data.name,
      description: data.description || "",
      accentColor: data.color || "indigo",
      totalMembers: data.members?.length || 0,
      owner: ownerMember?.name || "Workspace Owner",
      defaultHomePage,
      compactMode,
      enableNotifications,
      inviteCode: data.inviteCode,
    }
  },

  updateWorkspaceSettings: async (
    workspaceId: string,
    settings: WorkspaceSettings
  ): Promise<WorkspaceSettings> => {
    const response = await api.patch(`/workspaces/${workspaceId}`, {
      name: settings.name,
      description: settings.description,
      color: settings.accentColor,
    })

    localStorage.setItem(`workspace-pref-home-${workspaceId}`, settings.defaultHomePage)
    localStorage.setItem(`workspace-pref-compact-${workspaceId}`, settings.compactMode ? "true" : "false")
    localStorage.setItem(`workspace-pref-notify-${workspaceId}`, settings.enableNotifications ? "true" : "false")

    const data = response.data
    const ownerMember = data.members?.find((m: any) => m.id === data.ownerId)

    return {
      name: data.name,
      description: data.description || "",
      accentColor: data.color || "indigo",
      totalMembers: data.members?.length || 0,
      owner: ownerMember?.name || "Workspace Owner",
      defaultHomePage: settings.defaultHomePage,
      compactMode: settings.compactMode,
      enableNotifications: settings.enableNotifications,
      inviteCode: data.inviteCode,
    }
  },

  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`)
  },

  regenerateInviteCode: async (workspaceId: string): Promise<{ id: string; inviteCode: string }> => {
    const response = await api.post(`/workspaces/${workspaceId}/invite-code/regenerate`)
    return response.data
  },
}
