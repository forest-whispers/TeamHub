import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional(),
    color: z.string().trim().nullable().optional(),
});

export const updateWorkspaceSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().max(500).optional(),
    color: z.string().trim().nullable().optional(),
});

export const joinWorkspaceSchema = z.object({
    inviteCode: z.string().trim(),
});