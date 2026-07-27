import { z } from "zod";

export const renameFileSchema = z.object({
    displayName: z
        .string()
        .trim()
        .min(1)
        .max(255),
});

export const getFilesQuerySchema = z.object({

    cursor: z.string().cuid().optional(),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20),

    search: z.string().trim().optional(),

    mimeType: z.string().trim().optional(),

    uploadedBy: z.string().cuid().optional(),

    sortBy: z
        .enum([
            "createdAt",
            "displayName",
            "size",
        ])
        .default("createdAt"),

    sortOrder: z
        .enum([
            "asc",
            "desc",
        ])
        .default("desc"),

});