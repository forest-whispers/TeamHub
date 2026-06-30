import { z } from "zod";

export const updateMemberSchema = z.object({
    role: z.enum(["ADMIN", "MEMBER"]),
});