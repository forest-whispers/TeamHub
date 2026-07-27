import api from "@/shared/lib/api"
import type { WorkspaceAnalyticsData } from "../types"

export const workspaceAnalyticsService = {
  getWorkspaceAnalytics: async (
    workspaceId: string,
    timeRange: string
  ): Promise<WorkspaceAnalyticsData> => {
    const response = await api.get<WorkspaceAnalyticsData>(
      `/workspaces/${workspaceId}/analytics`,
      { params: { timeRange } }
    )
    return response.data
  },
}