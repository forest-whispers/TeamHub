import { useQuery } from "@tanstack/react-query"
import { authService } from "../services/authService"

export function useAuthStatus() {
  return useQuery({
    queryKey: ["auth-status"],
    queryFn: () => authService.getAuthStatus(),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })
}