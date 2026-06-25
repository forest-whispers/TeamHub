import type { AuthStatus, LoginCredentials, RegisterData } from "../types"

// Configurable mock credentials
export const MOCK_EMAIL = "user@teamhub.com"
export const MOCK_PASSWORD = "password"
export const MOCK_TAKEN_EMAIL = "taken@teamhub.com"

/**
 * Simulates a mock authentication session source.
 * This is decoupled from the service so that the service layer
 * only coordinates operations, and replacing it later requires changing
 * only the source of data.
 */
export async function getMockSession(): Promise<AuthStatus> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300))

  const isMockAuth = localStorage.getItem("teamhub-mock-authenticated") === "true"

  if (isMockAuth) {
    return {
      isAuthenticated: true,
      user: {
        id: "usr-1",
        name: "Alex Developer",
        email: "alex@teamhub.com",
      },
    }
  }

  return {
    isAuthenticated: false,
  }
}

/**
 * Simulates an asynchronous login backend endpoint.
 */
export async function mockLoginSession(credentials: LoginCredentials): Promise<AuthStatus> {
  // Simulate network latency for authenticating state
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (
    credentials.email.toLowerCase() === MOCK_EMAIL.toLowerCase() &&
    credentials.password === MOCK_PASSWORD
  ) {
    localStorage.setItem("teamhub-mock-authenticated", "true")
    return {
      isAuthenticated: true,
      user: {
        id: "usr-1",
        name: "Alex Developer",
        email: "alex@teamhub.com",
      },
    }
  }

  throw new Error("Invalid email or password")
}

/**
 * Simulates an asynchronous register backend endpoint.
 */
export async function mockRegisterSession(userData: RegisterData): Promise<AuthStatus> {
  // Simulate network latency for registering state
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (userData.email.toLowerCase() === MOCK_TAKEN_EMAIL.toLowerCase()) {
    throw new Error("This email is already registered")
  }

  localStorage.setItem("teamhub-mock-authenticated", "true")
  return {
    isAuthenticated: true,
    user: {
      id: "usr-2",
      name: userData.name,
      email: userData.email,
    },
  }
}
