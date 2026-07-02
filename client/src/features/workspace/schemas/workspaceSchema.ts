import { z } from "zod"

export const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  description: z.string().optional(),
  accentColor: z.string().min(1, "Accent color is required"),
})

export type WorkspaceFormData = z.infer<typeof workspaceSchema>