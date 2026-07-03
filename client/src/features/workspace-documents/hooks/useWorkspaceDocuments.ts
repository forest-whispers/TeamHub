import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { documentsService } from "../services/documentsService"
import type { UpdateDocumentData, WorkspaceDocument } from "../types"

export function useWorkspaceDocuments(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-documents", workspaceId],
    queryFn: () => documentsService.getDocuments(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 2,
  })
}

export function useCreateDocument(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; icon?: string }) =>
      documentsService.createDocument(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-documents"] })
    }
  })
}

export function useUpdateDocument(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: UpdateDocumentData }) =>
      documentsService.updateDocument(workspaceId, documentId, data),
    onSuccess: (updatedDoc, variables) => {
      // Update cache directly using setQueryData to avoid unnecessary refetches
      queryClient.setQueryData<WorkspaceDocument[]>(
        ["workspace-documents", workspaceId],
        (old) => {
          if (!old) return []
          return old.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
        }
      )
      // Synchronously update the document details query cache
      queryClient.setQueryData(
        ["document-detail", workspaceId, variables.documentId],
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            title: updatedDoc.title,
            icon: updatedDoc.icon,
          }
        }
      )
    },
  })
}

export function useDeleteDocument(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) =>
      documentsService.deleteDocument(workspaceId, documentId),
    onSuccess: (_, documentId) => {
      // Update workspace documents list cache directly
      queryClient.setQueryData<WorkspaceDocument[]>(
        ["workspace-documents", workspaceId],
        (old) => {
          if (!old) return []
          return old.filter((doc) => doc.id !== documentId)
        }
      )
      queryClient.invalidateQueries({ queryKey: ["document-detail"] })

      // Clean up any details cache queries matching this document ID
      queryClient.removeQueries({
        queryKey: ["document-detail", workspaceId, documentId],
      })
    },
  })
}