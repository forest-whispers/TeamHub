import type { Server } from "socket.io";

import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { joinWorkspace, updateWorkspace } from "./presence.handlers.js";
import { presenceService } from "./presence.service.js";
import type { JoinWorkspacePayload, UpdatePresencePayload, LeaveWorkspacePayload } from "./presence.types.js";
import type { SocketResponse } from "../../documents/collaboration/collaboration.types.js";


export function workspacePresenceSockets(io: Server) {
    io.on("connection", (socket) => {
        const client = socket as AuthenticatedSocket;
        const joinedWorkspaces = new Set<string>();

        client.on("workspace:join",
            async (
                payload: JoinWorkspacePayload,
                callback
            ) => {
                console.log("workspace:join requested")
                try {
                    joinedWorkspaces.add(payload.workspaceId);

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
            (
                payload: LeaveWorkspacePayload,
                callback: (response: SocketResponse) => void
            ) => {
                try {
                    console.log("workspace:leave requested")

                    joinedWorkspaces.delete(payload.workspaceId);

                    presenceService.removeConnection(
                        payload.workspaceId,
                        client.id,
                    );

                    const users = presenceService.getPresenceList(payload.workspaceId);

                    socket.leave(`workspace:${payload.workspaceId}`);

                    io.to(`workspace:${payload.workspaceId}`).emit("workspace:presence",
                        {
                            users,
                        });

                    console.log("workspace:leave", client.id,)
                    console.log("total users active in workspace:", users.length)
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

        // client.on("disconnect", () => {
        //     for (const wsId of joinedWorkspaces) {
        //         presenceService.removeConnection(wsId, client.id);
        //         const users = presenceService.getPresenceList(wsId);
        //         io.to(`workspace:${wsId}`).emit("workspace:presence", {
        //             users,
        //         });
        //     }
        // });
    });
}