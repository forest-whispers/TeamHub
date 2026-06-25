import { useQuery } from "@tanstack/react-query"
import { documentEditorService } from "../services/documentEditorService"

export function useDocumentDetail(workspaceId: string, documentId: string) {
  return useQuery({
    queryKey: ["document-detail", workspaceId, documentId],
    queryFn: () => documentEditorService.getDocument(workspaceId, documentId),
    enabled: !!workspaceId && !!documentId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
