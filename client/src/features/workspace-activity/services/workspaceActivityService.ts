import { getMockWorkspaceActivity } from "../mock/mockWorkspaceActivity"
import type { WorkspaceActivityItem } from "../types"

export const workspaceActivityService = {
  getWorkspaceActivity: async (workspaceId: string): Promise<WorkspaceActivityItem[]> => {
    // In production, this would make a network call:
    // const response = await axios.get<WorkspaceActivityItem[]>(`/api/workspaces/${workspaceId}/activity`)
    // return response.data
    return getMockWorkspaceActivity(workspaceId)
  },
}
