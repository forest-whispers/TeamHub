import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { JSONContent } from "@tiptap/core"
import { documentsService } from "@/features/workspace-documents/services/documentsService"

interface SaveDocumentPayload {
  workspaceId: string
  documentId: string
  content: JSONContent;
  snapshot?: number[];
}

export function useSaveDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, documentId, content, snapshot }: SaveDocumentPayload) =>
      documentsService.saveDocument(workspaceId, documentId, content, snapshot),
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