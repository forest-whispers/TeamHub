import axios from "axios";
import api from "@/shared/lib/api"
import type { AuthService, AuthStatus, LoginCredentials, RegisterData } from "../types"

export const authService: AuthService = {
  getAuthStatus: async (): Promise<AuthStatus> => {
    try {
      const response = await api.get("/users/me")
      if (!response.data || typeof response.data !== "object" || !response.data.id) {
        return {
          isAuthenticated: false,
        }
      }
      return {
        isAuthenticated: true,
        user: response.data,
      }
    } catch (error) {
      if (axios.isAxiosError(error) && (error.response?.status === 401)) {
        return {
          isAuthenticated: false,
        };
      }

      throw error;
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthStatus> => {
    await api.post("/auth/login", credentials)
    const response = await api.get("/users/me")
    return {
      isAuthenticated: true,
      user: response.data,
    }
  },

  register: async (userData: RegisterData): Promise<AuthStatus> => {
    await api.post("/auth/register", userData)
    const response = await api.get("/users/me")
    return {
      isAuthenticated: true,
      user: response.data,
    }
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout")
  },
}