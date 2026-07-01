import api from "@/shared/lib/api"
import type { DashboardService, RecentDocument, Workspace, ActivityItem } from "../types"
import { getMockContinueWorking, getMockRecentActivity } from "../mock/mockDashboard"

export const dashboardService: DashboardService = {
  getContinueWorking: async (): Promise<RecentDocument | null> => {
    return getMockContinueWorking()
  },

  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get<any[]>("/workspaces")
    return response.data.map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description || "",
      memberCount: w.memberCount,
      // documentCount and lastActivity are left undefined since the backend does not return them
    }))
  },

  getRecentActivity: async (): Promise<ActivityItem[]> => {
    return getMockRecentActivity()
  },
}
