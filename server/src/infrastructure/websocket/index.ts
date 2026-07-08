import type { Server } from "socket.io";

import { socketAuth } from "./auth.js";
import type { AuthenticatedSocket } from "./types.js";

import { registerDocumentSockets } from "../../modules/documents/collaboration/collaboration.socket.js";
import { workspacePresenceSockets } from "../../modules/workspaces/presence/presence.socket.js";

import { yjsService } from "../../modules/documents/collaboration/yjs.service.js";
import { unregisterAwarenessClient } from "../../modules/documents/collaboration/awareness.service.js";
import { presenceService } from "../../modules/workspaces/presence/presence.service.js";

export function initializeWebSocket(io: Server) {
    io.use(socketAuth);

    registerDocumentSockets(io)

    workspacePresenceSockets(io)

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