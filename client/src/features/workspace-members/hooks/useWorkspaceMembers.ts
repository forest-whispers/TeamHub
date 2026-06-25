import { useQuery } from "@tanstack/react-query"
import { workspaceMembersService } from "../services/workspaceMembersService"

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => workspaceMembersService.getWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useWorkspaceMemberDetails(workspaceId: string, memberId: string) {
  return useQuery({
    queryKey: ["workspace-member-details", workspaceId, memberId],
    queryFn: () => workspaceMembersService.getMemberDetails(workspaceId, memberId),
    enabled: !!workspaceId && !!memberId,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
  })
}

