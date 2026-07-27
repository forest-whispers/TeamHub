import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { Server } from "socket.io";
import type { TypingPayload } from "./chat.types.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js";

export async function joinChatRoom(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string,
) {
    socket.join(`document:${documentId}:chat`);

    return {
        documentId,
    };
}

export async function leaveChatRoom(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string,
) {
    socket.leave(`document:${documentId}:chat`);
}

export async function broadcastTyping(
    io: Server,
    socket: AuthenticatedSocket,
    payload: TypingPayload,
) {
    socket
        .to(`document:${payload.documentId}:chat`)
        .emit("chat:typing", {
            user: {
                id: socket.data.user.id,
                name: socket.data.user.name,
            },
            isTyping: payload.isTyping,
        });
}