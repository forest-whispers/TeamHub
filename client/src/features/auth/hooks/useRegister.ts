import { useMutation, useQueryClient } from "@tanstack/react-query"
import { authService } from "../services/authService"
import type { RegisterData } from "../types"

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (data) => {
      
      queryClient.setQueryData(["auth-status"], data)
    },
  })
}