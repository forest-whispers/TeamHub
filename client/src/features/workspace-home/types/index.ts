export interface WorkspaceHomeData {
  recentDocuments: RecentDocument[]
  recentActivity: RecentActivity[]
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

export interface WorkspaceHomeService {
  getWorkspaceHome(workspaceId: string): Promise<WorkspaceHomeData>
}