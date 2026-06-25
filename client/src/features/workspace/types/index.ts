export interface CreateWorkspaceData {
  name: string
  description?: string
  accentColor: string
}

export interface WorkspaceService {
  createWorkspace(workspaceData: CreateWorkspaceData): Promise<any>
  joinWorkspace(joinCode: string): Promise<any>
}
