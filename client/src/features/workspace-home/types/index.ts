import type { WorkspaceActivity } from "../../workspace-activity/types";

export interface WorkspaceHomeData {
  recentDocuments: RecentDocument[]
  recentActivity: WorkspaceActivity[]
}

export interface RecentDocument {
  id: string
  name: string
  lastEdited: string
  lastEditedBy: string
}

export interface WorkspaceHomeService {
  getWorkspaceHome(workspaceId: string): Promise<WorkspaceHomeData>
}