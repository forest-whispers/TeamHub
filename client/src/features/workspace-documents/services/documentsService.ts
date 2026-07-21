import api from "@/shared/lib/api"
import type { JSONContent } from "@tiptap/core"
import type { DocumentsService, CreateDocumentData, UpdateDocumentData } from "../types"

export const documentsService: DocumentsService = {
  getDocuments: async (workspaceId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/documents`)
    return data
  },

  getDocument: async (workspaceId, documentId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/documents/${documentId}`)

    return data
  },

  createDocument: async (workspaceId: string, data: CreateDocumentData): Promise<{ id: string }> => {
    const response = await api.post(`/workspaces/${workspaceId}/documents`, {
      title: data.title,
      icon: data.icon,
    })
    return response.data
  },

  updateDocument: async ( workspaceId: string, documentId: string, data: UpdateDocumentData): Promise<any> => {
    const response = await api.patch(`/workspaces/${workspaceId}/documents/${documentId}`, {
      title: data.title,
      icon: data.icon,
    })
    return response.data
  },

  saveDocument: async (workspaceId: string, documentId: string, content: JSONContent, snapshot?: number[], description?: string): Promise<any> => {
    const payload: Record<string, any> = { content }
    if (snapshot && snapshot.length > 0) {
      payload.snapshot = snapshot
    }
    if (description) {
      payload.description = description
    }
    const response = await api.patch(`/workspaces/${workspaceId}/documents/${documentId}/content`, payload)
    return response.data
  },

  deleteDocument: async (workspaceId: string, documentId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/documents/${documentId}`)
  },
}