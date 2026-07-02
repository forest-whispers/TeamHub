import { useQuery } from "@tanstack/react-query"
import { documentsService } from "@/features/workspace-documents/services/documentsService"

export function useDocumentDetail(workspaceId: string, documentId: string) {
  return useQuery({
    queryKey: ["document-detail", workspaceId, documentId],
    queryFn: () => documentsService.getDocument(workspaceId, documentId),
    enabled: !!workspaceId && !!documentId,
    staleTime: 1000 * 60 * 5,
  })
}