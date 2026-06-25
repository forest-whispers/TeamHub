import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../services/authService"
import type { LoginCredentials } from "../types"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Optimistically update or invalidate the query cache
      queryClient.setQueryData(["auth-status"], data)
      queryClient.invalidateQueries({ queryKey: ["auth-status"] })
    },
  })
}
