import { Server } from "socket.io";
import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { joinNotificationRoom, leaveNotificationRoom } from "./notification.service.js";

export function registerNotificationSockets(io: Server) {
    io.on("connection", (socket) => {
        const client = socket as AuthenticatedSocket;

        client.on("notification:join",
            async (
                payload: any,
                callback?: (response: { success: boolean; message?: string }) => void
            ) => {
                let cb = callback;
                if (typeof payload === "function") {
                    cb = payload;
                }
                try {
                    await joinNotificationRoom(client);
                    cb?.({ success: true });
                } catch (error) {
                    cb?.({
                        success: false,
                        message: error instanceof Error ? error.message : "Failed to join notification room",
                    });
                }
            }
        );

        client.on("notification:leave",
            async (
                payload: any,
                callback?: (response: { success: boolean; message?: string }) => void
            ) => {
                let cb = callback;
                if (typeof payload === "function") {
                    cb = payload;
                }
                try {
                    await leaveNotificationRoom(client);
                    cb?.({ success: true });
                } catch (error) {
                    cb?.({
                        success: false,
                        message: error instanceof Error ? error.message : "Failed to leave notification room",
                    });
                }
            }
        );
    });
}