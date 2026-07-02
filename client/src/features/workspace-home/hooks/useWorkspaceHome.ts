import { useQuery } from "@tanstack/react-query"
import { workspaceHomeService } from "../services/workspaceHomeService"

export function useWorkspaceHome(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-home", workspaceId],
    queryFn: () => workspaceHomeService.getWorkspaceHome(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60,
  })
}