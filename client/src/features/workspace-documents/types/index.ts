export interface WorkspaceDocument {
  id: string
  name: string
  lastEdited: string
  lastEditedBy: string
  createdAt: string
  workspaceId: string
}

export interface DocumentsService {
  getDocuments(workspaceId: string): Promise<WorkspaceDocument[]>
  renameDocument(workspaceId: string, documentId: string, newName: string): Promise<WorkspaceDocument>
  deleteDocument(workspaceId: string, documentId: string): Promise<void>
}
