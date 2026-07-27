import { z } from "zod";

export const sendMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .max(5000)
        .optional(),

    replyToId: z
        .string()
        .cuid()
        .nullable()
        .optional(),

    mentionedUserIds: z
        .array(z.string().uuid())
        .max(10)
        .optional(),
}).refine(
    (data) =>
        (data.content?.trim().length ?? 0) > 0 || data.replyToId,
    {
        message: "Message cannot be empty.",
        path: ["content"],
    }
);

export const editMessageSchema = z.object({
    content: z
        .string()
        .trim()
        .min(1)
        .max(5000),

    mentionedUserIds: z
        .array(z.string().uuid())
        .max(10)
        .optional(),
});

export const toggleReactionSchema = z.object({
    emoji: z.enum([
        "👍",
        "❤️",
        "😂",
        "😮",
        "😢",
        "🎉",
    ]),
});