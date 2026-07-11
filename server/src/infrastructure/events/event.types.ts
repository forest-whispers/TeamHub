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

export interface DomainEventMap {
    "document.created": DocumentCreatedEvent;
    "document.renamed": DocumentRenamedEvent;
    "document.deleted": DocumentDeletedEvent;
}

export type DomainEventName = keyof DomainEventMap;