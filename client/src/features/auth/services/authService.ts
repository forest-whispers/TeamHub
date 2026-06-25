import type { AuthService, AuthStatus, LoginCredentials, RegisterData } from "../types"
import { getMockSession, mockLoginSession, mockRegisterSession } from "../mock/mockSession"

// This toggle controls whether to run mock data or actual API.
// Setting this to false will direct the service to call your production endpoints.
const USE_MOCK = true

export const authService: AuthService = {
  getAuthStatus: async (): Promise<AuthStatus> => {
    if (USE_MOCK) {
      return getMockSession()
    }

    // Future backend integration:
    // const response = await api.get<AuthStatus>("/auth/status");
    // return response.data;
    throw new Error("Backend authentication service integration not implemented yet.")
  },

  login: async (credentials: LoginCredentials): Promise<AuthStatus> => {
    if (USE_MOCK) {
      return mockLoginSession(credentials)
    }

    // Future backend integration:
    // const response = await api.post<AuthStatus>("/auth/login", credentials);
    // return response.data;
    throw new Error("Backend login service integration not implemented yet.")
  },

  register: async (userData: RegisterData): Promise<AuthStatus> => {
    if (USE_MOCK) {
      return mockRegisterSession(userData)
    }

    // Future backend integration:
    // const response = await api.post<AuthStatus>("/auth/register", userData);
    // return response.data;
    throw new Error("Backend register service integration not implemented yet.")
  },
}
