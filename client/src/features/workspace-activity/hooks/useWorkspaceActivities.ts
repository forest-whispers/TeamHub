import { useQuery } from "@tanstack/react-query";

import { activityService } from "../services/workspaceActivityService";

export function useWorkspaceActivities(
  workspaceId: string,
  limit = 5
) {
  return useQuery({
    queryKey: ["workspace-activities", workspaceId, limit],

    queryFn: () =>
      activityService.getActivities(
        workspaceId,
        limit
      ),

    enabled: !!workspaceId,

    staleTime: 1000 * 30,
  });
}