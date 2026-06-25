import type { DocumentEditorService, WorkspaceDocumentDetail } from "../types"
import { getMockDocument } from "../mock/mockDocumentEditor"

const USE_MOCK = true

export const documentEditorService: DocumentEditorService = {
  getDocument: async (workspaceId: string, documentId: string): Promise<WorkspaceDocumentDetail> => {
    if (USE_MOCK) {
      return getMockDocument(workspaceId, documentId)
    }
    throw new Error("Live document editor service not integrated.")
  },
}
