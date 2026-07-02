export interface WorkspaceMember {
  id: string
  name: string
  email: string
  avatar: string | null
  status?: "online" | "away" | "offline"
  role: "OWNER" | "ADMIN" | "MEMBER"
  joinedAt?: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  color: string
  inviteCode: string
  ownerId: string
  createdAt: string
  members: WorkspaceMember[]
  onlineCount?: number
}

export interface CreateWorkspaceData {
  name: string
  description?: string
  accentColor: string
}

export interface CreateWorkspaceResponse {
  id: string
  inviteCode: string
}

export interface JoinWorkspaceResponse {
  id: string
  inviteCode: string
}

export interface WorkspaceService {
  createWorkspace(workspaceData: CreateWorkspaceData): Promise<CreateWorkspaceResponse>
  joinWorkspace(joinCode: string): Promise<JoinWorkspaceResponse>
  getWorkspace(workspaceId: string): Promise<Workspace>
  leaveWorkspace(workspaceId: string): Promise<void>
}