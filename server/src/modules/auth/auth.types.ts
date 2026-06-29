export interface JwtPayload {
    sub: string;
    sessionId: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResult extends AuthTokens {
    sessionId: string;
}