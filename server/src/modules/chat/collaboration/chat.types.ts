export interface JoinChatPayload {
    workspaceId: string;
    documentId: string;
}

export interface LeaveChatPayload {
    workspaceId: string;
    documentId: string;
}

export interface TypingPayload {
    workspaceId: string;
    documentId: string;
    isTyping: boolean;
}