import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceSettingsService } from "../services/workspaceSettingsService"
import { workspaceService } from "@/features/workspace/services/workspaceService"
import type { WorkspaceSettings } from "../types"

export function useWorkspaceSettings(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: !!workspaceId,
    select: (data) => {
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
  })
}

export function useUpdateWorkspaceSettings(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (settings: WorkspaceSettings) =>
      workspaceSettingsService.updateWorkspaceSettings(workspaceId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] })
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}

export function useDeleteWorkspace(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => workspaceSettingsService.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}

export function useRegenerateInviteCode(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => workspaceSettingsService.regenerateInviteCode(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] })
    },
  })
}
