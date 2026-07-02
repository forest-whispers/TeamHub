import api from "@/shared/lib/api"
import type {
  Workspace,
  WorkspaceService,
  CreateWorkspaceData,
  CreateWorkspaceResponse,
  JoinWorkspaceResponse,
} from "../types"

export const workspaceService: WorkspaceService = {
  async createWorkspace(workspaceData: CreateWorkspaceData): Promise<CreateWorkspaceResponse> {
    const { data } = await api.post("/workspaces", {
      name: workspaceData.name,
      description: workspaceData.description,
      color: workspaceData.accentColor,
    })

    return data
  },

  async joinWorkspace(joinCode: string): Promise<JoinWorkspaceResponse> {
    const { data } = await api.post("/workspaces/join", {
      inviteCode: joinCode,
    })

    return data
  },

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const { data } = await api.get(`/workspaces/${workspaceId}`)
    return data
  },

  async leaveWorkspace(workspaceId: string): Promise<void> {
    await api.post(`/workspaces/${workspaceId}/members/leave`)
  },
}