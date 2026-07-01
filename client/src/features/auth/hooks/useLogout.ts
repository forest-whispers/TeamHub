import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../services/authService"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["auth-status"], { isAuthenticated: false })
    },
    onError: () => {
      // Fallback: clear status anyway on failure to prevent blockages
      queryClient.setQueryData(["auth-status"], { isAuthenticated: false })
    },
  })
}