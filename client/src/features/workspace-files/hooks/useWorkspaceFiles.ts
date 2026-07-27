import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { InfiniteData } from "@tanstack/react-query"
import { workspaceFilesService } from "../services/workspaceFilesService"
import type { WorkspaceFile } from "../types"

export function useWorkspaceFiles(
  workspaceId: string,
  params?: { search?: string; mimeType?: string }
) {
  return useInfiniteQuery({
    queryKey: ["workspace-files", workspaceId, params],
    queryFn: ({ pageParam }) =>
      workspaceFilesService.getWorkspaceFiles(workspaceId, {
        ...params,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!workspaceId,
  })
}

export function useUploadFile(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => workspaceFilesService.uploadFile(workspaceId, file),
    onSuccess: (newFile) => {
      queryClient.setQueriesData<InfiniteData<{ files: WorkspaceFile[]; nextCursor?: string }>>(
        { queryKey: ["workspace-files", workspaceId] },
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page, idx) => {
              if (idx === 0) {
                return {
                  ...page,
                  files: [newFile, ...page.files],
                }
              }
              return page
            }),
          }
        }
      )
      // Refresh workspace home recent documents/files view
      queryClient.invalidateQueries({ queryKey: ["workspace-home", workspaceId] })
    },
  })
}

export function useRenameFile(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fileId, displayName }: { fileId: string; displayName: string }) =>
      workspaceFilesService.renameFile(workspaceId, fileId, displayName),
    onSuccess: (updatedFile) => {
      queryClient.setQueriesData<InfiniteData<{ files: WorkspaceFile[]; nextCursor?: string }>>(
        { queryKey: ["workspace-files", workspaceId] },
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              files: page.files.map((f) => (f.id === updatedFile.id ? updatedFile : f)),
            })),
          }
        }
      )
      // Refresh workspace home recent documents/files view
      queryClient.invalidateQueries({ queryKey: ["workspace-home", workspaceId] })
    },
  })
}

export function useDeleteFile(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fileId: string) => workspaceFilesService.deleteFile(workspaceId, fileId),
    onSuccess: (_, fileId) => {
      queryClient.setQueriesData<InfiniteData<{ files: WorkspaceFile[]; nextCursor?: string }>>(
        { queryKey: ["workspace-files", workspaceId] },
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              files: page.files.filter((f) => f.id !== fileId),
            })),
          }
        }
      )
      // Refresh workspace home recent documents/files view
      queryClient.invalidateQueries({ queryKey: ["workspace-home", workspaceId] })
    },
  })
}