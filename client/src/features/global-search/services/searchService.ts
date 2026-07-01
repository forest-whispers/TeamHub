import type { SearchService, SearchResult } from "../types"
import { mockGlobalSearch } from "../mock/mockSearch"

const USE_MOCK = true

export const searchService: SearchService = {
  globalSearch: async (workspaceId: string, query: string): Promise<SearchResult[]> => {
    if (USE_MOCK) {
      return mockGlobalSearch(workspaceId, query)
    }
    throw new Error("Live search service not integrated.")
  },
}