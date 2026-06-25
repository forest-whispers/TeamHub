import type { WorkspaceService, CreateWorkspaceData } from "../types"
import { mockCreateWorkspace, mockJoinWorkspace } from "../mock/mockWorkspace"

// Toggle this to run mock vs live API endpoints.
const USE_MOCK = true

export const workspaceService: WorkspaceService = {
  createWorkspace: async (workspaceData: CreateWorkspaceData): Promise<any> => {
    if (USE_MOCK) {
      return mockCreateWorkspace(workspaceData)
    }

    // Future backend integration:
    // const response = await api.post("/workspaces", workspaceData);
    // return response.data;
    throw new Error("Backend workspace creation integration not implemented yet.")
  },

  joinWorkspace: async (joinCode: string): Promise<any> => {
    if (USE_MOCK) {
      return mockJoinWorkspace(joinCode)
    }

    // Future backend integration:
    // const response = await api.post(`/workspaces/join`, { joinCode });
    // return response.data;
    throw new Error("Backend join workspace integration not implemented yet.")
  },
}
