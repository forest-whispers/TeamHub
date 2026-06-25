export interface WorkspaceFile {
  id: string
  name: string
  size: string
  type: "document" | "image" | "spreadsheet" | "archive" | "media"
  uploadedBy: string
  uploadedAt: string
}

export interface WorkspaceFilesService {
  getWorkspaceFiles(workspaceId: string): Promise<WorkspaceFile[]>
}
