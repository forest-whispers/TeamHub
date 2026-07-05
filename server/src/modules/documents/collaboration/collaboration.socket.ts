import type { Server } from "socket.io";

import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { joinDocument, leaveDocument } from "./collaboration.service.js";
import type { JoinDocumentPayload, LeaveDocumentPayload, } from "./collaboration.types.ts";
import { yjsService } from "./yjs.service.js";

export function registerDocumentSockets(io: Server) {
    io.on("connection", (socket) => {
        const client = socket as AuthenticatedSocket;

        client.on(
            "document:join",
            async (
                payload: JoinDocumentPayload,
                callback: (response: {
                    success: boolean;
                    data?: { documentId: string };
                    message?: string;
                }) => void
            ) => {
                try {
                    const response = await joinDocument(
                        client,
                        payload.workspaceId,
                        payload.documentId
                    );

                    console.log("document:joined")
                    callback({
                        success: true,
                        data: response,
                    });
                } catch (error: any) {
                    callback({
                        success: false,
                        message: error instanceof Error ? error.message : "Something went wrong",
                    });
                }
            }
        );

        client.on(
            "document:leave",
            async (
                payload: LeaveDocumentPayload,
                callback: (response: {
                    success: boolean;
                    data?: { documentId: string };
                    message?: string;
                }) => void
            ) => {
                try {
                    const response = await leaveDocument(
                        client,
                        payload.documentId
                    );

                    console.log("document:leave")
                    callback({
                        success: true,
                        data: response,
                    });
                } catch (error: any) {
                    callback({
                        success: false,
                        message: error instanceof Error ? error.message : "Something went wrong",
                    });
                }
            }
        );

        client.on("disconnect", async () => {
            for (const room of client.rooms) {
                if (!room.startsWith("document:")) continue;

                const documentId = room.replace("document:", "");

                await yjsService.removeUser(documentId, client.data.user.id);
            }
        });
    });
}