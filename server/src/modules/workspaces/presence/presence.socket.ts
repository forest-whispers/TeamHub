import type { Server } from "socket.io";

import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { joinWorkspace, updateWorkspace, leaveWorkspace } from "./presence.handlers.js";
import type { JoinWorkspacePayload, UpdatePresencePayload, LeaveWorkspacePayload } from "./presence.types.js";
import type { SocketResponse } from "../../documents/collaboration/collaboration.types.js";


export function workspacePresenceSockets(io: Server) {
    io.on("connection", (socket) => {
        const client = socket as AuthenticatedSocket;

        client.on("workspace:join",
            async (
                payload: JoinWorkspacePayload,
                callback
            ) => {
                console.log("workspace:join requested")
                try {

                    const users = await joinWorkspace(
                            client,
                            payload.workspaceId,
                            payload.presence
                        );

                    io.to(`workspace:${payload.workspaceId}`).emit("workspace:presence",
                        {
                            users,
                        });

                    console.log("workspace:join >> broadcasted");
                    callback({
                        success: true,
                        data: {
                            users,
                        },
                    });

                } catch (error) {

                    callback({
                        success: false,
                        message: error instanceof Error ? error.message : "Unknown error",
                    });

                }
            }
        );

        client.on("workspace:update",
            async (
                payload: UpdatePresencePayload,
                callback: (response: SocketResponse) => void
            ) => {
                console.log("workspace:update received")
                try {

                    const users = await updateWorkspace(
                        client,
                        payload.workspaceId,
                        payload.presence
                    );

                    io.to(`workspace:${payload.workspaceId}`).emit("workspace:presence",
                        {
                            users,
                        });

                    console.log("workspace:update >> broadcasted");
                    callback({
                        success: true,
                    });

                } catch (error) {

                    callback({
                        success: false,
                        message: error instanceof Error ? error.message : "Unknown error",
                    });

                }
            }
        );

        client.on("workspace:leave",
            async (
                payload: LeaveWorkspacePayload,
                callback: (response: SocketResponse) => void
            ) => {
                try {
                    console.log("workspace:leave requested")

                    const users = await leaveWorkspace(
                        client,
                        payload.workspaceId
                    );

                    io.to(`workspace:${payload.workspaceId}`).emit("workspace:presence",
                        {
                            users,
                        });

                    socket.leave(`workspace:${payload.workspaceId}`);

                    console.log("workspace:leave")
                    callback({
                        success: true,
                    });

                } catch (error) {

                    callback({
                        success: false,
                        message: error instanceof Error ? error.message : "Unknown error",
                    });

                }
            }
        );

        client.on("disconnecting", async () => {
            for (const room of client.rooms) {

                if (!room.startsWith("workspace:")) {
                    continue;
                }

                const workspaceId = room.replace("workspace:", "");

                await leaveWorkspace(
                    client,
                    workspaceId
                );
            }
        });

    });
}