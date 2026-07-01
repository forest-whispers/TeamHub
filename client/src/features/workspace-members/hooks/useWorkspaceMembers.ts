import { useQuery } from "@tanstack/react-query"
import { workspaceService } from "@/features/workspace/services/workspaceService"
import type { WorkspaceMember, WorkspaceMemberDetails } from "../types"

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: !!workspaceId,
    select: (data): WorkspaceMember[] => {
      return data.members?.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        avatarUrl: m.avatar || undefined,
      })) || []
    },
  })
}

export function useWorkspaceMemberDetails(workspaceId: string, memberId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: !!workspaceId && !!memberId,
    select: (data): WorkspaceMemberDetails | null => {
      const member = data.members?.find((m: any) => m.id === memberId)
      if (!member) return null

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        avatarUrl: member.avatar || undefined,
        joinedDate: member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : undefined,
      }
    },
  })
}

