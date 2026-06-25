import type { WorkspaceHomeService, WorkspaceSummary, RecentDocument, RecentActivity, WorkspaceMember } from "../types"
import {
  getMockWorkspaceSummary,
  getMockRecentDocuments,
  getMockRecentActivity,
  getMockWorkspaceMembers,
} from "../mock/mockWorkspaceHome"

const USE_MOCK = true

export const workspaceHomeService: WorkspaceHomeService = {
  getWorkspaceSummary: async (workspaceId: string): Promise<WorkspaceSummary> => {
    if (USE_MOCK) {
      return getMockWorkspaceSummary(workspaceId)
    }
    throw new Error("Live workspace summary endpoint not integrated.")
  },

  getRecentDocuments: async (workspaceId: string): Promise<RecentDocument[]> => {
    if (USE_MOCK) {
      return getMockRecentDocuments(workspaceId)
    }
    throw new Error("Live recent documents endpoint not integrated.")
  },

  getRecentActivity: async (workspaceId: string): Promise<RecentActivity[]> => {
    if (USE_MOCK) {
      return getMockRecentActivity(workspaceId)
    }
    throw new Error("Live recent activity endpoint not integrated.")
  },

  getWorkspaceMembers: async (workspaceId: string): Promise<WorkspaceMember[]> => {
    if (USE_MOCK) {
      return getMockWorkspaceMembers(workspaceId)
    }
    throw new Error("Live workspace members endpoint not integrated.")
  },
}
