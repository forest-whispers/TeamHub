export interface CreateSnapshotInput {
    documentId: string;
    createdById: string;
    state: Uint8Array;
    description?: string;
}