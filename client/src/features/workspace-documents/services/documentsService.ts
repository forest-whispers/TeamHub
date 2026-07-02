import api from "@/shared/lib/api"
import type { DocumentsService, CreateDocumentData, UpdateDocumentData } from "../types"

export const documentsService: DocumentsService = {
  getDocuments: async (workspaceId) => {
    const { data } = await api.get(`/workspaces/${workspaceId}/documents`)
    return data
  },

  getDocument: async (workspaceId, documentId) => {
    //later
    throw new Error("later")
  },

  createDocument: async (workspaceId: string, data: CreateDocumentData): Promise<{ id: string }> => {
    const response = await api.post(`/workspaces/${workspaceId}/documents`, {
      title: data.title,
      icon: data.icon,
    })
    return response.data
  },

  updateDocument: async ( workspaceId: string, documentId: string, data: UpdateDocumentData): Promise<any> => {
    // later
    throw new Error("Not implemented yet")
  },

  deleteDocument: async (workspaceId: string, documentId: string): Promise<void> => {
    // later
    throw new Error("Not implemented yet")
  },
}