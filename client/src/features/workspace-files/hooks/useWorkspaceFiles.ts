import { useQuery } from "@tanstack/react-query"
import { workspaceFilesService } from "../services/workspaceFilesService"

export function useWorkspaceFiles(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-files", workspaceId],
    queryFn: () => workspaceFilesService.getWorkspaceFiles(workspaceId),
    enabled: !!workspaceId,
  })
}
