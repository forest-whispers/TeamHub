import type { WorkspaceHomeService } from "../types"

export const workspaceHomeService: WorkspaceHomeService = {
  getWorkspaceHome: async (_workspaceId) => {

    /*
    const { data } = await api.get<WorkspaceHomeData>(`/workspaces/${workspaceId}/home`);

    return data;
    */

    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      recentDocuments: [],
      recentActivity: [],
    };
  },
};