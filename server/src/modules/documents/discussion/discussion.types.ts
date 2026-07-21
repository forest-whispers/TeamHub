import { z } from "zod";

export const createDiscussionSchema = z.object({
    anchor: z.any(),
    quotedText: z.string().trim().optional(),
    message: z.string().trim().min(1).max(5000),
});

export const replyDiscussionSchema = z.object({
    message: z.string().trim().min(1).max(5000),
});

export const resolveDiscussionSchema = z.object({
    resolved: z.boolean(),
});

export type CreateDiscussionDto = z.infer<typeof createDiscussionSchema>;
export type ReplyDiscussionDto = z.infer<typeof replyDiscussionSchema>;
export type ResolveDiscussionDto = z.infer<typeof resolveDiscussionSchema>;