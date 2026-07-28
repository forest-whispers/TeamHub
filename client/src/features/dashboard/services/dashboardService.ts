import api from "@/shared/lib/api"
import type { DashboardService, DashboardData } from "../types"
import { formatActivityTime } from "@/features/workspace-activity/lib/activityTime"

export const dashboardService: DashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const { data } = await api.get<any>("/dashboard")

    const workspaces = (data.workspaces || []).map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description ?? "",
      memberCount: w.memberCount,
      documentCount: w.documentCount,
      fileCount: w.fileCount,
      lastActivity: w.lastActivityAt ? formatActivityTime(w.lastActivityAt) : undefined,
      adminEmail: w.adminEmail ?? "",
    }))

    const continueWorking = data.continueWorking
      ? {
          id: data.continueWorking.id,
          name: data.continueWorking.title,
          workspaceId: data.continueWorking.workspaceId,
          workspaceName: data.continueWorking.workspaceName,
          lastOpened: formatActivityTime(data.continueWorking.updatedAt),
        }
      : null

    const recentActivity = data.recentActivity || []

    const overview = data.overview || {
      totalWorkspaces: 0,
      totalDocuments: 0,
      totalFiles: 0,
      totalMembers: 0,
    }

    return {
      workspaces,
      continueWorking,
      recentActivity,
      overview,
    }
  },
}