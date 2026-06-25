import type { DashboardService, RecentDocument, Workspace, ActivityItem } from "../types"
import { getMockContinueWorking, getMockWorkspaces, getMockRecentActivity } from "../mock/mockDashboard"

// Toggle this to run mock vs live API endpoints.
const USE_MOCK = true

export const dashboardService: DashboardService = {
  getContinueWorking: async (): Promise<RecentDocument | null> => {
    if (USE_MOCK) {
      return getMockContinueWorking()
    }
    // Future backend integration:
    // const response = await api.get<RecentDocument | null>("/dashboard/continue-working");
    // return response.data;
    throw new Error("Backend dashboard continue-working integration not implemented yet.")
  },

  getWorkspaces: async (): Promise<Workspace[]> => {
    if (USE_MOCK) {
      return getMockWorkspaces()
    }
    // Future backend integration:
    // const response = await api.get<Workspace[]>("/dashboard/workspaces");
    // return response.data;
    throw new Error("Backend dashboard workspaces integration not implemented yet.")
  },

  getRecentActivity: async (): Promise<ActivityItem[]> => {
    if (USE_MOCK) {
      return getMockRecentActivity()
    }
    // Future backend integration:
    // const response = await api.get<ActivityItem[]>("/dashboard/recent-activity");
    // return response.data;
    throw new Error("Backend dashboard recent-activity integration not implemented yet.")
  },
}
