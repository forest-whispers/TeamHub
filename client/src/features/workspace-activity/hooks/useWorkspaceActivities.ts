import { useQuery } from "@tanstack/react-query";

import { activityService } from "../services/workspaceActivityService";

export function useWorkspaceActivities(
  workspaceId: string,
  limit = 5,
  cursor?: string
) {
  return useQuery({
    queryKey: ["workspace-activities", workspaceId, limit, cursor],

    queryFn: () =>
      activityService.getActivities(
        workspaceId,
        limit,
        cursor
      ),

    enabled: !!workspaceId,

    staleTime: 1000 * 30,
  });
}