import { useQuery } from "@tanstack/react-query"
import { workspaceHomeService } from "../services/workspaceHomeService"
import { workspaceService } from "@/features/workspace/services/workspaceService"
import type { WorkspaceMember } from "../types"

export function useWorkspaceSummary(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: !!workspaceId,
    select: (data) => ({
      id: data.id,
      name: data.name,
      description: data.description || "",
      memberCount: data.members?.length || 0,
      onlineCount: undefined as number | undefined,
    }),
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
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: !!workspaceId,
    select: (data): WorkspaceMember[] => {
      return data.members?.map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        avatarUrl: m.avatar || undefined,
      })) || []
    },
  })
}
