import { getMockWorkspaceFiles } from "../mock/mockWorkspaceFiles"
import type { WorkspaceFile } from "../types"

export const workspaceFilesService = {
  getWorkspaceFiles: async (workspaceId: string): Promise<WorkspaceFile[]> => {
    // In production, this would make a network call:
    // const response = await axios.get<WorkspaceFile[]>(`/api/workspaces/${workspaceId}/files`)
    // return response.data
    return getMockWorkspaceFiles(workspaceId)
  },
}
