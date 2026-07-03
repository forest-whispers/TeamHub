import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { JSONContent } from "@tiptap/core"
import { documentsService } from "@/features/workspace-documents/services/documentsService"

interface UpdateContentPayload {
  workspaceId: string
  documentId: string
  content: JSONContent
}

export function useUpdateDocumentContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, documentId, content }: UpdateContentPayload) =>
      documentsService.updateDocumentContent(workspaceId, documentId, content),
    onSuccess: (_, variables) => {
      // Synchronously update the document detail query cache
      queryClient.setQueryData(
        ["document-detail", variables.workspaceId, variables.documentId],
        (oldData: any) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            content: variables.content,
            updatedAt: new Date().toISOString(),
          }
        }
      )
    },
  })
}