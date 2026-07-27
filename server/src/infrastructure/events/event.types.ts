import type { createDiscussion, replyDiscussion, resolveDiscussion } from "../../modules/documents/discussion/discussion.service.js";

import { sendMessage, editMessage, pinMessage, unpinMessage } from "../../modules/chat/chat.service.js";
export interface DocumentCreatedEvent {
    workspaceId: string;
    documentId: string;
    actorId: string;
    title: string;
}

export interface DocumentRenamedEvent {
    workspaceId: string;
    documentId: string;
    actorId: string;
    oldTitle: string;
    newTitle: string;
}

export interface DocumentDeletedEvent {
    workspaceId: string;
    documentId: string;
    actorId: string;
    title: string;
}

export type DiscussionCreatedPayload = Awaited<
    ReturnType<typeof createDiscussion>
>;

export interface DiscussionCreatedEvent {
    documentId: string;
    discussion: DiscussionCreatedPayload;
    socketId?: string | undefined;
}

export type DiscussionReplyCreatedPayload = Awaited<
    ReturnType<typeof replyDiscussion>
>;

export interface DiscussionReplyCreatedEvent {
    documentId: string;
    discussionId: string;
    reply: DiscussionReplyCreatedPayload;
    socketId?: string | undefined;
}

export type DiscussionUpdatedPayload = Awaited<
    ReturnType<typeof resolveDiscussion>
>;

export interface DiscussionUpdatedEvent {
    documentId: string;
    discussion: DiscussionUpdatedPayload;
    socketId?: string | undefined;
}

export interface DiscussionDeletedEvent {
    documentId: string;
    discussionId: string;
    socketId?: string | undefined;
}

export interface DiscussionReplyDeletedEvent {
    documentId: string;
    discussionId: string;
    replyId: string;
    socketId?: string | undefined;
}

export type ChatMessagePayload = Awaited<
    ReturnType<typeof sendMessage>
>;

export type ChatMessageEditedPayload = Awaited<
    ReturnType<typeof editMessage>
>;

export type ChatMessagePinnedPayload = Awaited<
    ReturnType<typeof pinMessage>
>;

export interface MessageCreatedEvent {
    workspaceId: string;
    documentId: string;
    message: ChatMessagePayload;
    socketId?: string | undefined;
}

export interface MessageUpdatedEvent {
    workspaceId: string;
    documentId: string;
    message: ChatMessageEditedPayload;
    socketId?: string | undefined;
}

export interface MessageDeletedEvent {
    workspaceId: string;
    documentId: string;
    messageId: string;
    socketId?: string | undefined;
}

export interface MessagePinnedEvent {
    workspaceId: string;
    documentId: string;
    message: ChatMessagePinnedPayload;
    socketId?: string | undefined;
}

export interface MessageUnpinnedEvent {
    workspaceId: string;
    documentId: string;
    messageId: string;
    socketId?: string | undefined;
}

export interface MessageSeenEvent {
    workspaceId: string;
    documentId: string;
    messageId: string;
    userId: string;
}

export interface ChatMessageReaction {
    id: string;
    emoji: string;
    userId: string;
}

export interface ChatMessageReactionUpdatedEvent {
    workspaceId: string;
    documentId: string;
    messageId: string;
    reactions: ChatMessageReaction[];
    socketId?: string;
}

export interface DomainEventMap {
    "document.created": DocumentCreatedEvent;
    "document.renamed": DocumentRenamedEvent;
    "document.deleted": DocumentDeletedEvent;

    "discussion.created": DiscussionCreatedEvent;
    "discussion.reply.created": DiscussionReplyCreatedEvent;
    "discussion.updated": DiscussionUpdatedEvent;
    "discussion.deleted": DiscussionDeletedEvent;
    "discussion.reply.deleted": DiscussionReplyDeletedEvent;

    "chat.message.created": MessageCreatedEvent;
    "chat.message.updated": MessageUpdatedEvent;
    "chat.message.deleted": MessageDeletedEvent;
    "chat.message.pinned": MessagePinnedEvent;
    "chat.message.unpinned": MessageUnpinnedEvent;
    "chat.message.reaction.updated": ChatMessageReactionUpdatedEvent;

    "chat.message.seen": MessageSeenEvent;
}

export type DomainEventName = keyof DomainEventMap;