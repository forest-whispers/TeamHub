export interface WorkspaceActivityItem {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  type: "document" | "comment" | "member" | "workspace"
}

export interface WorkspaceActivityService {
  getWorkspaceActivity(workspaceId: string): Promise<WorkspaceActivityItem[]>
}
