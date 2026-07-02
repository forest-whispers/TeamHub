import { useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceService } from "../services/workspaceService"
import type { CreateWorkspaceData } from "../types"

export function useCreateWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceData: CreateWorkspaceData) =>
      workspaceService.createWorkspace(workspaceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useJoinWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (joinCode: string) => workspaceService.joinWorkspace(joinCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function useLeaveWorkspace() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.leaveWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}