import { useQuery } from "@tanstack/react-query"
import { workspaceService } from "../services/workspaceService"

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => workspaceService.getWorkspace(workspaceId),
    enabled: !!workspaceId,
  })
}
