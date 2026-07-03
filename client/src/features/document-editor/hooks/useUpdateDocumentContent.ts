import { useMutation, useQueryClient } from "@tanstack/react-query"
import { documentsService } from "@/features/workspace-documents/services/documentsService"

export function useUpdateDocumentContent(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: any) =>
      documentsService.updateDocumentContent(workspaceId, documentId, content),
    onSuccess: () => {},
  })
}