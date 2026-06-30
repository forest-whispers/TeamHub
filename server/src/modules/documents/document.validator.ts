import { z } from "zod";

export const createDocumentSchema = z.object({
    title: z.string().trim().min(1).max(100),
});

export const updateDocumentSchema = z.object({
    title: z.string().trim().min(1).max(100).optional(),
    icon: z.string().trim().max(10).nullable().optional(),
});