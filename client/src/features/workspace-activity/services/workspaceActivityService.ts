import api from "@/shared/lib/api";
import type { WorkspaceActivity } from "../types/index"

interface ActivityResponse {
  success: boolean;
  data: {
    activities: WorkspaceActivity[];
    nextCursor: string | null;
    hasMore: boolean;
  };
}

export const activityService = {
  getActivities: async (
    workspaceId: string,
    limit = 5,
    cursor?: string
  ): Promise<{ activities: WorkspaceActivity[]; nextCursor: string | null; hasMore: boolean }> => {
    const { data } = await api.get<ActivityResponse>(
      `/workspaces/${workspaceId}/activities`,
      {
        params: {
          limit,
          cursor,
        },
      }
    );

    return data.data;
  },
};