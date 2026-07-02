import type { SearchService, SearchResult } from "../types"

const USE_MOCK = true

export const searchService: SearchService = {
  globalSearch: async (workspaceId: string, query: string): Promise<SearchResult[]> => {
    if (USE_MOCK) {
      return []
    }
    throw new Error("Live search service not integrated.")
  },
}