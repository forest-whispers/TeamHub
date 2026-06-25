import { useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceService } from "../services/workspaceService"
import type { CreateWorkspaceData } from "../types"

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceData: CreateWorkspaceData) =>
      workspaceService.createWorkspace(workspaceData),
    onSuccess: () => {
      // Invalidate the workspaces query to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}

export function useJoinWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (joinCode: string) => workspaceService.joinWorkspace(joinCode),
    onSuccess: () => {
      // Invalidate the workspaces query to trigger a background refetch
      queryClient.invalidateQueries({ queryKey: ["workspaces"] })
    },
  })
}
