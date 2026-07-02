import type { JSONContent } from "@tiptap/core"

export interface WorkspaceDocument {
    id: string
    title: string
    icon?: string | null

    createdAt: string
    updatedAt: string

    createdBy: {
        id: string
        name: string
    }

    workspaceId?: string
    content?: JSONContent
}