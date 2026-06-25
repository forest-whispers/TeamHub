import { getMockWorkspaceMembers, getMockMemberDetails } from "../mock/mockWorkspaceMembers"
import type { WorkspaceMember, WorkspaceMemberDetails } from "../types"

export const workspaceMembersService = {
  getWorkspaceMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
    return getMockWorkspaceMembers(workspaceId)
  },

  getMemberDetails: async (
    workspaceId: string,
    memberId: string
  ): Promise<WorkspaceMemberDetails> => {
    // In production, this would call:
    // const response = await axios.get<WorkspaceMemberDetails>(`/api/workspaces/${workspaceId}/members/${memberId}`)
    // return response.data
    return getMockMemberDetails(workspaceId, memberId)
  },
}
