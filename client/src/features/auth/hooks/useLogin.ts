import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../services/authService"
import type { LoginCredentials } from "../types"

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      
      queryClient.setQueryData(["auth-status"], data)
    },
  })
}