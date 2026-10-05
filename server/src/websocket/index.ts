import type { Server } from "socket.io";

import { socketAuth } from "./auth.js";
import type { AuthenticatedSocket } from "./types.js";

import { registerDocumentSockets } from "../features/documents/collaboration/collaboration.socket.js";
import { workspacePresenceSockets } from "../features/workspaces/presence/socket.js";

import { yjsService } from "../features/documents/collaboration/yjs.service.js";
import { unregisterAwarenessClient } from "../features/documents/collaboration/awareness.service.js";
import { presenceService } from "../features/workspaces/presence/service.js";
import { registerChatSockets } from "../features/chat/realtime/socket.js";
import { registerNotificationSockets } from "../features/notifications/realtime/socket.js";

export function initializeWebSocket(io: Server) {
    io.use(socketAuth);

    registerDocumentSockets(io)

    workspacePresenceSockets(io)

    registerChatSockets(io);

    registerNotificationSockets(io);

    io.on("connection", (socket) => {
        const client = socket as AuthenticatedSocket;

        client.on("disconnecting", async () => {

            const rooms = Array.from(client.rooms);

            for (const room of rooms) {

                if (room.startsWith("document:")) {

                    const documentId = room.replace("document:", "");

                    const update = unregisterAwarenessClient(
                            documentId,
                            client.id,
                        );

                    if (update) {
                        socket.to(room).emit("awareness:update",
                                update,
                            );
                    }

                    await yjsService.removeUser(
                        documentId,
                        client.id,
                    );

                    continue;
                }

                if (room.startsWith("workspace:")) {

                    const workspaceId = room.replace("workspace:", "");

                    presenceService.removeConnection(
                        workspaceId,
                        client.id,
                    );

                    const users = presenceService.getPresenceList(
                            workspaceId,
                        );

                    io.to(room).emit("workspace:presence",
                        {
                            users,
                        },
                    );

                    continue;
                }
            }

            console.log("socket disconnected:", client.id,);
        });
    });
}