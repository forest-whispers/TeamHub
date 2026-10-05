import type { Socket } from "socket.io";

export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    sessionId: string;
}

export interface AuthenticatedSocket extends Socket {
    data: {
        user: AuthenticatedUser;
    };
}