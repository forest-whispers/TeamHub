import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../services/authService"
import { socket } from "@/shared/lib/socket"

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {

      socket.disconnect();
      queryClient.setQueryData(["auth-status"], { isAuthenticated: false })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onError: () => {
      // Fallback: clear status anyway on failure to prevent blockages
      queryClient.setQueryData(["auth-status"], { isAuthenticated: false })
    },
  })
}