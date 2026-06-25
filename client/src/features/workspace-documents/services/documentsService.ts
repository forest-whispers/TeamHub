import type { DocumentsService, WorkspaceDocument } from "../types"
import { getMockDocuments, renameMockDocument, deleteMockDocument } from "../mock/mockDocuments"

const USE_MOCK = true

export const documentsService: DocumentsService = {
  getDocuments: async (workspaceId: string): Promise<WorkspaceDocument[]> => {
    if (USE_MOCK) {
      return getMockDocuments(workspaceId)
    }
    throw new Error("Live documents retrieval endpoint not integrated.")
  },

  renameDocument: async (
    workspaceId: string,
    documentId: string,
    newName: string
  ): Promise<WorkspaceDocument> => {
    if (USE_MOCK) {
      return renameMockDocument(workspaceId, documentId, newName)
    }
    throw new Error("Live document renaming endpoint not integrated.")
  },

  deleteDocument: async (workspaceId: string, documentId: string): Promise<void> => {
    if (USE_MOCK) {
      return deleteMockDocument(workspaceId, documentId)
    }
    throw new Error("Live document deletion endpoint not integrated.")
  },
}
