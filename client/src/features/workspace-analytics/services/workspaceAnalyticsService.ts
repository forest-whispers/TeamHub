import { getMockWorkspaceAnalytics } from "../mock/mockWorkspaceAnalytics"
import type { WorkspaceAnalyticsData } from "../types"

export const workspaceAnalyticsService = {
  getWorkspaceAnalytics: async (
    workspaceId: string,
    timeRange: string
  ): Promise<WorkspaceAnalyticsData> => {
    // In production, this would call:
    // const response = await axios.get<WorkspaceAnalyticsData>(`/api/workspaces/${workspaceId}/analytics`, { params: { timeRange } })
    // return response.data
    return getMockWorkspaceAnalytics(workspaceId, timeRange)
  },
}
