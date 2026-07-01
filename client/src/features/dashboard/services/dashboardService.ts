import api from "@/shared/lib/api"
import type { DashboardService, DashboardData, Workspace } from "../types"

export const dashboardService: DashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const { data: workspaces } = await api.get<Workspace[]>("/workspaces")

    return {
      workspaces,
      continueWorking: null,
      recentActivity: [],
    }
  },
}