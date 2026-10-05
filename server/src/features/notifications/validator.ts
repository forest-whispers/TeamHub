import { z } from "zod";

export const getNotificationsSchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).optional(),
});