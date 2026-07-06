import type { Server } from "socket.io";

import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { joinDocument, updateDocument, leaveDocument } from "./collaboration.service.js";
import type { JoinDocumentPayload, DocumentUpdatePayload, LeaveDocumentPayload, SocketResponse } from "./collaboration.types.ts";
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
                    console.log("document:joined requested")
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
            "document:update",
            async (
                payload: DocumentUpdatePayload,
                callback: (response: SocketResponse) => void
            ) => {
                console.log("received updates")
                try {
                    await updateDocument(
                        client,
                        payload.workspaceId,
                        payload.documentId,
                        payload.update
                    );

                    callback({
                        success: true,
                    });
                } catch (error) {
                    callback({
                        success: false,
                        message:
                            error instanceof Error
                                ? error.message
                                : "Unknown error",
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
                    console.log("document:leave requested")
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
            console.log("document:disconnected")
        });
    });
}