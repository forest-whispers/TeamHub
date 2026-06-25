import { useQuery } from "@tanstack/react-query"
import { workspaceActivityService } from "../services/workspaceActivityService"

export function useWorkspaceActivity(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-activity", workspaceId],
    queryFn: () => workspaceActivityService.getWorkspaceActivity(workspaceId),
    enabled: !!workspaceId,
  })
}
