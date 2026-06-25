export interface WorkspaceDocumentDetail {
  id: string
  name: string
  content: any // Tiptap JSON node structure
  lastEdited: string
  lastEditedBy: string
  createdAt: string
  workspaceId: string
}

export interface DocumentEditorService {
  getDocument(workspaceId: string, documentId: string): Promise<WorkspaceDocumentDetail>
}
