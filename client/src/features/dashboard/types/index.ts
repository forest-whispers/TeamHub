import type { WorkspaceActivity } from "@/features/workspace-activity/types"

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
  documentCount: number
  fileCount: number
  lastActivity?: string
  adminEmail: string
}

export interface DashboardOverview {
  totalWorkspaces: number
  totalDocuments: number
  totalFiles: number
  totalMembers: number
}

export interface DashboardData {
  workspaces: Workspace[]
  continueWorking: RecentDocument | null
  recentActivity: WorkspaceActivity[]
  overview: DashboardOverview
}

export interface DashboardService {
  getDashboard(): Promise<DashboardData>
}