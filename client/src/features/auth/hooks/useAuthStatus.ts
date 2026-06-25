import { useQuery } from "@tanstack/react-query"
import { authService } from "../services/authService"

export function useAuthStatus() {
  return useQuery({
    queryKey: ["auth-status"],
    queryFn: () => authService.getAuthStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
