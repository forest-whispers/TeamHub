export interface DiscussionUser {
    id: string;
    name: string;
    avatar: string | null;
}

export interface DiscussionReply {
    id: string;
    message: string;

    createdAt: string;
    updatedAt: string;

    createdBy: DiscussionUser;
}

export interface DocumentDiscussion {
    id: string;

    anchor: any;

    quotedText: string | null;

    resolved: boolean;

    resolvedAt: string | null;

    createdAt: string;
    updatedAt: string;

    createdBy: DiscussionUser;

    replies: DiscussionReply[];
}

export interface CreateDiscussionPayload {
    anchor: any;
    quotedText?: string;
    message: string;
}

export interface ReplyDiscussionPayload {
    message: string;
    documentId: string;
}

export interface ResolveDiscussionPayload {
    resolved: boolean;
}