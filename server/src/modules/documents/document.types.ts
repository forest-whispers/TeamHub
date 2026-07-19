import { Prisma } from '@prisma/client';

export interface CreateDocumentDto {
    title: string;
    icon?: string | null;
}

export interface UpdateDocumentDto {
    title?: string;
    icon?: string | null;
}

export interface SaveDocumentDto {
    // content: JSON,
    content: Prisma.InputJsonValue,
    snapshot: number[]
}