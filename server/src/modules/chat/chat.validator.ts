import { z } from "zod";

export const sendMessageSchema = z.object({
    body: z.object({
        content: z
            .string()
            .trim()
            .max(5000)
            .optional(),

        replyToId: z
            .string()
            .uuid()
            .nullable()
            .optional(),

        mentions: z
            .array(z.string().cuid())
            .max(10)
            .optional(),
    }),
}).refine(
    (data) =>
        (data.body.content?.trim().length ?? 0) > 0 || data.body.replyToId,
    {
        message: "Message cannot be empty.",
        path: ["body", "content"],
    }
);

export const editMessageSchema = z.object({
    body: z.object({
        content: z
            .string()
            .trim()
            .min(1)
            .max(5000),

        mentions: z
            .array(z.string().cuid())
            .max(10)
            .optional(),
    }),
});

export const toggleReactionSchema = z.object({
    body: z.object({
        emoji: z.enum([
            "👍",
            "❤️",
            "😂",
            "😮",
            "😢",
            "🎉",
        ]),
    }),
});