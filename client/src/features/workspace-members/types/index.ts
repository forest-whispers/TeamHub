export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: string
  status?: "online" | "away" | "offline"
  avatarUrl?: string
}

export interface WorkspaceMemberDetails extends WorkspaceMember {
  joinedDate?: string
  lastActive?: string
  bio?: string
}

export interface WorkspaceMembersService {
  getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]>
  getMemberDetails(workspaceId: string, memberId: string): Promise<WorkspaceMemberDetails>
}
