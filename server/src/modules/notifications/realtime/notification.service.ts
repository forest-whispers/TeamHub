import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";

export async function joinNotificationRoom(socket: AuthenticatedSocket) {
    const userId = socket.data.user.id;
    socket.join(`notifications:${userId}`);
}

export async function leaveNotificationRoom(socket: AuthenticatedSocket) {
    const userId = socket.data.user.id;
    socket.leave(`notifications:${userId}`);
}