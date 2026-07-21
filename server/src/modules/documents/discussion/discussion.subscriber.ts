import { eventBus } from "../../../infrastructure/events/event-bus.js";
import { getIO } from "../../../infrastructure/websocket/socket.js";

export function registerDocDiscussionSubscriber() {

    const io = getIO()

    eventBus.on("discussion.created", async (event) => {
        let broadcast = io.to(`document:${event.documentId}`);
        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }
        broadcast.emit(
            "document:discussion:created",
            event.discussion
        );
    });

    eventBus.on("discussion.reply.created", async (event) => {
        let broadcast = io.to(`document:${event.documentId}`);
        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }
        broadcast.emit(
            "document:reply:created",
            {
                discussionId: event.discussionId,
                reply: event.reply,
            }
        );
    });

    eventBus.on("discussion.updated", async (event) => {
        let broadcast = io.to(`document:${event.documentId}`);
        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }
        broadcast.emit(
            "document:discussion:updated",
            event.discussion
        );
    });

    eventBus.on("discussion.deleted", async (event) => {
        let broadcast = io.to(`document:${event.documentId}`);
        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }
        broadcast.emit(
            "document:discussion:deleted",
            {
                discussionId: event.discussionId,
            }
        );
    });

    eventBus.on("discussion.reply.deleted", async (event) => {
        let broadcast = io.to(`document:${event.documentId}`);
        if (event.socketId) {
            broadcast = broadcast.except(event.socketId);
        }
        broadcast.emit(
            "document:reply:deleted",
            {
                discussionId: event.discussionId,
                replyId: event.replyId,
            }
        );
    });
}