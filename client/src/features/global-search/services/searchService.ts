import api from "@/shared/lib/api"
import type { SearchService, SearchResult } from "../types"

export const searchService: SearchService = {
  globalSearch: async (workspaceId: string, query: string): Promise<SearchResult[]> => {
    const { data } = await api.get<{
      results: Array<{
        id: string
        type: "DOCUMENT" | "FILE" | "MEMBER" | "DISCUSSION" | "CHAT"
        title: string
        description: string
        entityId: string
        workspaceId: string
        score: number
        documentId?: string
      }>
    }>("/search", {
      params: {
        q: query,
        workspaceId,
      },
    })

    return data.results.map((res): SearchResult => {
      let category: SearchResult["category"] = "Documents"
      let type: SearchResult["type"] = "document"
      let navigationTarget = `/workspace/${workspaceId}/home`

      switch (res.type) {
        case "DOCUMENT":
          category = "Documents"
          type = "document"
          navigationTarget = `/workspace/${workspaceId}/documents/${res.entityId}`
          break
        case "FILE":
          category = "Files"
          type = "file"
          navigationTarget = `/workspace/${workspaceId}/files`
          break
        case "MEMBER":
          category = "Members"
          type = "member"
          navigationTarget = `/workspace/${workspaceId}/members`
          break
        case "DISCUSSION":
          category = "Documents"
          type = "document"
          navigationTarget = `/workspace/${workspaceId}/documents/${res.documentId || res.entityId}`
          break
        case "CHAT":
          category = "Documents"
          type = "document"
          navigationTarget = `/workspace/${workspaceId}/chat/${res.documentId || res.entityId}`
          break
      }

      return {
        id: res.id,
        title: res.title,
        subtitle: res.description,
        category,
        type,
        navigationTarget,
        metadata: {
          entityId: res.entityId,
          score: res.score,
        },
      }
    })
  },
}