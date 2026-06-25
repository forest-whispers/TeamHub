import { z } from "zod"

export const joinWorkspaceSchema = z.object({
  joinCode: z.string().min(1, "Join code is required"),
})

export type JoinWorkspaceFormData = z.infer<typeof joinWorkspaceSchema>
