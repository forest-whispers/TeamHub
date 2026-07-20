import type { JSONContent } from "@tiptap/core"

export interface WorkspaceDocument {
  id: string
  title: string
  icon: string | null
  updatedAt: string
  createdAt?: string
  createdBy: {
    id: string
    name: string
  }
}

export interface CreateDocumentData {
  title: string
  icon?: string
}

export interface UpdateDocumentData {
  title: string
  icon?: string | null
}

// export interface SaveDocumentData {
//   content: JSONContent;
//   snapshot: number[];
// }

export interface DocumentsService {
  getDocuments(workspaceId: string): Promise<WorkspaceDocument[]>
  getDocument(workspaceId: string, documentId: string): Promise<any>
  createDocument(workspaceId: string, data: CreateDocumentData): Promise<{ id: string }>
  updateDocument( workspaceId: string, documentId: string, data: UpdateDocumentData): Promise<any>
  deleteDocument(workspaceId: string, documentId: string): Promise<void>
  saveDocument(workspaceId: string, documentId: string, content: JSONContent, snapshot?: number[]): Promise<any>
}