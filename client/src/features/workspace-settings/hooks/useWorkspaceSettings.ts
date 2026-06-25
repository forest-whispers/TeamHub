import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceSettingsService } from "../services/workspaceSettingsService"
import type { WorkspaceSettings } from "../types"

export function useWorkspaceSettings(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-settings", workspaceId],
    queryFn: () => workspaceSettingsService.getWorkspaceSettings(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useUpdateWorkspaceSettings(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (settings: WorkspaceSettings) =>
      workspaceSettingsService.updateWorkspaceSettings(workspaceId, settings),
    onSuccess: (updatedData) => {
      // Update the React Query cache directly using setQueryData
      queryClient.setQueryData(["workspace-settings", workspaceId], updatedData)
    },
  })
}
