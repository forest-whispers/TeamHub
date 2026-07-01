import api from "@/shared/lib/api"
import type { WorkspaceService, CreateWorkspaceData } from "../types"

export const workspaceService: WorkspaceService = {
  createWorkspace: async (workspaceData: CreateWorkspaceData): Promise<any> => {
    const response = await api.post("/workspaces", {
      name: workspaceData.name,
      description: workspaceData.description,
      color: workspaceData.accentColor,
    })
    return response.data
  },

  joinWorkspace: async (joinCode: string): Promise<any> => {
    const response = await api.post("/workspaces/join", {
      inviteCode: joinCode,
    })
    return response.data
  },

  getWorkspace: async (workspaceId: string): Promise<any> => {
    const response = await api.get(`/workspaces/${workspaceId}`)
    return response.data
  },
}
