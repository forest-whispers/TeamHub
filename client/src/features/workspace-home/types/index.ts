export interface WorkspaceSummary {
  id: string
  name: string
  description: string
  memberCount: number
  onlineCount: number
}

export interface RecentDocument {
  id: string
  name: string
  lastEdited: string
  lastEditedBy: string
}

export interface RecentActivity {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

export interface WorkspaceMember {
  id: string
  name: string
  role: string
  status: "online" | "away" | "offline"
  avatarUrl?: string
}

export interface WorkspaceHomeService {
  getWorkspaceSummary(workspaceId: string): Promise<WorkspaceSummary>
  getRecentDocuments(workspaceId: string): Promise<RecentDocument[]>
  getRecentActivity(workspaceId: string): Promise<RecentActivity[]>
  getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]>
}
