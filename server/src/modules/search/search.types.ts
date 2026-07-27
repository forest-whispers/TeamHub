export type SearchResultType = "DOCUMENT" | "FILE" | "MEMBER" | "DISCUSSION" | "CHAT";

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    description: string;
    entityId: string;
    workspaceId: string;
    score: number;
    documentId?: string;
}

export interface SearchResponse {
    results: SearchResult[];
}