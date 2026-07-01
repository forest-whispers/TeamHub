import axios from "axios";
import api from "@/shared/lib/api";
import type { AuthService, AuthStatus, LoginCredentials, RegisterData } from "../types";

export const authService: AuthService = {
  async getAuthStatus(): Promise<AuthStatus> {
    try {
      const { data } = await api.get("/users/me");

      return {
        isAuthenticated: true,
        user: data,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return {
          isAuthenticated: false,
        };
      }

      throw error;
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthStatus> {
    await api.post("/auth/login", credentials);

    const { data } = await api.get("/users/me");

    return {
      isAuthenticated: true,
      user: data,
    };
  },

  async register(userData: RegisterData): Promise<AuthStatus> {
    await api.post("/auth/register", userData);

    const { data } = await api.get("/users/me");

    return {
      isAuthenticated: true,
      user: data,
    };
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};