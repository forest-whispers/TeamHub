export interface JoinDocumentPayload {
    workspaceId: string;
    documentId: string;
}

export interface DocumentUpdatePayload {
    workspaceId: string;
    documentId: string;
    update: Uint8Array;
}

export interface AwarenessUpdatePayload {
    workspaceId: string;
    documentId: string;
    clientId: number;
    update: Uint8Array;
}

export interface SocketResponse<T = void> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface LeaveDocumentPayload {
    documentId: string;
}