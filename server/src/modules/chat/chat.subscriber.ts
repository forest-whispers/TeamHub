import { eventBus } from "../../infrastructure/events/event-bus.js";
import { getIO } from "../../infrastructure/websocket/socket.js";

export function registerChatSubscriber() {

    const io = getIO()

    eventBus.on("chat.message.created", async (event) => {
        let broadcast = io.to(`document:${event.documentId}:chat`);
        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }
        broadcast.emit("chat:message:new", event.message);
    });

    eventBus.on("chat.message.updated", async (event) => {
        let broadcast = io.to(`document:${event.documentId}:chat`);
        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }
        broadcast.emit("chat:message:updated", event.message);
    });

    eventBus.on("chat.message.pinned", async (event) => {
        let broadcast = io.to(`document:${event.documentId}:chat`);

        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }

        broadcast.emit("chat:message:pinned", {
            messageId: event.message?.id,
            pinnedBy: event.message?.pinnedBy,
            pinnedAt: event.message?.pinnedAt,
        });
    });

    eventBus.on("chat.message.unpinned", async (event) => {
        let broadcast = io.to(`document:${event.documentId}:chat`);

        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }

        broadcast.emit("chat:message:unpinned", {
            messageId: event.messageId,
        });
    });

    eventBus.on("chat.message.reaction.updated", async (event) => {

        let broadcast = io.to(`document:${event.documentId}:chat`);

        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }

        broadcast.emit("chat:message:reaction", {
            messageId: event.messageId,
            reactions: event.reactions,
        });

    });

    eventBus.on("chat.message.deleted", async (event) => {
        let broadcast = io.to(`document:${event.documentId}:chat`);

        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }

        broadcast.emit("chat:message:deleted", { messageId: event.messageId, });
    });
}