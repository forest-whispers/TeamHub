import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "../services/dashboardService"

export function useContinueWorking() {
  return useQuery({
    queryKey: ["continue-working"],
    queryFn: () => dashboardService.getContinueWorking(),
    staleTime: 1000 * 60 * 1, // 1 minute
  })
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => dashboardService.getWorkspaces(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: () => dashboardService.getRecentActivity(),
    staleTime: 1000 * 60 * 1, // 1 minute
  })
}
