import { useQuery } from "@tanstack/react-query"
import { workspaceAnalyticsService } from "../services/workspaceAnalyticsService"

export function useWorkspaceAnalytics(workspaceId: string, timeRange: string) {
  return useQuery({
    queryKey: ["workspace-analytics", workspaceId, timeRange],
    queryFn: () => workspaceAnalyticsService.getWorkspaceAnalytics(workspaceId, timeRange),
    enabled: !!workspaceId,
  })
}
