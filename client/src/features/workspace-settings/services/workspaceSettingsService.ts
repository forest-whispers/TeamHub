import { getMockWorkspaceSettings, updateMockWorkspaceSettings } from "../mock/mockWorkspaceSettings"
import type { WorkspaceSettings } from "../types"

export const workspaceSettingsService = {
  getWorkspaceSettings: async (workspaceId: string): Promise<WorkspaceSettings> => {
    return getMockWorkspaceSettings(workspaceId)
  },
  updateWorkspaceSettings: async (
    workspaceId: string,
    settings: WorkspaceSettings
  ): Promise<WorkspaceSettings> => {
    return updateMockWorkspaceSettings(workspaceId, settings)
  },
}
