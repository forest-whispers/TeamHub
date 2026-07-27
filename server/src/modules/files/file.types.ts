import { Prisma } from "@prisma/client";

export interface RenameFileInput {
    displayName: string;
}

export interface GetFilesQuery {
    cursor?: string;
    limit?: number;

    search?: string;

    mimeType?: string;

    uploadedBy?: string;

    sortBy?: "createdAt" | "displayName" | "size";

    sortOrder?: Prisma.SortOrder;
}