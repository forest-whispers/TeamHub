export interface CreateDocumentDto {
    title: string;
    icon?: string | null;
}

export interface UpdateDocumentDto {
    title?: string;
    icon?: string | null;
}