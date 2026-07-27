import { z } from "zod";

export const searchSchema = z.object({
    q: z.string().trim().min(1, "Query must not be empty"),
    workspaceId: z.string().optional(),
});