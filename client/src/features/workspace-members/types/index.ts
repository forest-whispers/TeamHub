export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: string
  status?: "online" | "away" | "offline"
  avatar?: string
}

export interface WorkspaceMemberDetails extends WorkspaceMember {
  joinedDate?: string
  lastActive?: string
  bio?: string
}