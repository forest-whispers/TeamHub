export interface JoinDocumentPayload {
    workspaceId: string;
    documentId: string;
}

export interface LeaveDocumentPayload {
    documentId: string;
}