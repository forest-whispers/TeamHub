import api from "@/shared/lib/api"
import type { WorkspaceHomeData, WorkspaceHomeService } from "../types"

export const workspaceHomeService: WorkspaceHomeService = {
  getWorkspaceHome: async (workspaceId) => {
    const { data } =
      await api.get<{
        success: boolean;
        data: WorkspaceHomeData;
      }>(
        `/workspaces/${workspaceId}/home`
      );

    return data.data;
  },
};