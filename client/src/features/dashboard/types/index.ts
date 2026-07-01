export interface RecentDocument {
  id: string
  name: string
  workspaceId: string
  workspaceName: string
  lastOpened: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  memberCount: number
  documentCount?: number
  lastActivity?: string
}

export interface ActivityItem {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

export interface DashboardService {
  getContinueWorking(): Promise<RecentDocument | null>
  getWorkspaces(): Promise<Workspace[]>
  getRecentActivity(): Promise<ActivityItem[]>
}
