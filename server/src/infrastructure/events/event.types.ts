import type { createDiscussion, replyDiscussion, resolveDiscussion } from "../../modules/documents/discussion/discussion.service.js";

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

export interface DomainEventMap {
    "document.created": DocumentCreatedEvent;
    "document.renamed": DocumentRenamedEvent;
    "document.deleted": DocumentDeletedEvent;
    "discussion.created": DiscussionCreatedEvent;
    "discussion.reply.created": DiscussionReplyCreatedEvent;
    "discussion.updated": DiscussionUpdatedEvent;
    "discussion.deleted": DiscussionDeletedEvent;
    "discussion.reply.deleted": DiscussionReplyDeletedEvent;
}

export type DomainEventName = keyof DomainEventMap;