import { useQuery } from "@tanstack/react-query"
import { workspaceHomeService } from "../services/workspaceHomeService"

export function useWorkspaceSummary(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-home-summary", workspaceId],
    queryFn: () => workspaceHomeService.getWorkspaceSummary(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })
}

export function useWorkspaceRecentDocuments(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-home-recent-documents", workspaceId],
    queryFn: () => workspaceHomeService.getRecentDocuments(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })
}

export function useWorkspaceActivity(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-home-activity", workspaceId],
    queryFn: () => workspaceHomeService.getRecentActivity(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 1, // 1 minute cache
  })
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-home-members", workspaceId],
    queryFn: () => workspaceHomeService.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
