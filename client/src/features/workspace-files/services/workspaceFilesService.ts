import api from "@/shared/lib/api"
import type { WorkspaceFile } from "../types"

export const workspaceFilesService = {
  getWorkspaceFiles: async (
    workspaceId: string,
    params?: { cursor?: string; limit?: number; search?: string; mimeType?: string }
  ): Promise<{ files: WorkspaceFile[]; nextCursor?: string }> => {
    const { data } = await api.get(`/workspaces/${workspaceId}/files`, { params })
    return data
  },

  uploadFile: async (workspaceId: string, file: File): Promise<WorkspaceFile> => {
    const formData = new FormData()
    formData.append("file", file)
    const { data } = await api.post(`/workspaces/${workspaceId}/files`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  },

  renameFile: async (workspaceId: string, fileId: string, displayName: string): Promise<WorkspaceFile> => {
    const { data } = await api.patch(`/workspaces/${workspaceId}/files/${fileId}`, {
      displayName,
    })
    return data
  },

  deleteFile: async (workspaceId: string, fileId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/files/${fileId}`)
  },
}