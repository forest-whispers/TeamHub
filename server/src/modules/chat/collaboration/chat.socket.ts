import { Server } from "socket.io";

import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";

import {
    joinChatRoom,
    leaveChatRoom,
    broadcastTyping,
} from "./chat.service.js";

import type {
    JoinChatPayload,
    LeaveChatPayload,
    TypingPayload,
} from "./chat.types.js";

export function registerChatSockets(io: Server) {
    io.on("connection", (socket) => {

        const client = socket as AuthenticatedSocket;

        client.on(
            "chat:join",
            async (
                payload: JoinChatPayload,
                callback: (response: {
                    success: boolean;
                    data?: { documentId: string };
                    message?: string;
                }) => void
            ) => {
                try {
                    const response = await joinChatRoom(
                        client,
                        payload.workspaceId,
                        payload.documentId
                    );

                    callback({
                        success: true,
                        data: response,
                    });
                } catch (error) {
                    callback({
                        success: false,
                        message:
                            error instanceof Error
                                ? error.message
                                : "Something went wrong",
                    });
                }
            }
        );

        client.on(
            "chat:leave",
            async (
                payload: LeaveChatPayload,
                callback: (response: {
                    success: boolean;
                    message?: string;
                }) => void
            ) => {
                try {
                    await leaveChatRoom(
                        client,
                        payload.workspaceId,
                        payload.documentId
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
                                : "Something went wrong",
                    });
                }
            }
        );

        client.on(
            "chat:typing",
            async (
                payload: TypingPayload,
                callback: (response: {
                    success: boolean;
                    message?: string;
                }) => void
            ) => {
                try {
                    await broadcastTyping(
                        io,
                        client,
                        payload
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
                                : "Something went wrong",
                    });
                }
            }
        );
    });
}