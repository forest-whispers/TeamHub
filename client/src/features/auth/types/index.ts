export interface AuthUser {
  id: string
  name: string
  email: string
  avatar: string | null
  isEmailVerified: boolean
}

export interface AuthStatus {
  isAuthenticated: boolean
  user?: AuthUser
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthService {
  getAuthStatus(): Promise<AuthStatus>
  login(credentials: LoginCredentials): Promise<AuthStatus>
  register(userData: RegisterData): Promise<AuthStatus>
  logout(): Promise<void>
}