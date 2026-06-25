import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { searchService } from "../services/searchService"
import type { SearchResult } from "../types"

/**
 * A reusable hook to debounce state changes.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Executes an asynchronous global search query with a configurable debounce delay.
 */
export function useGlobalSearch(workspaceId: string, query: string, delay = 250) {
  const debouncedQuery = useDebounce(query, delay)
  const normalizedQuery = debouncedQuery.trim()

  return useQuery<SearchResult[]>({
    queryKey: ["global-search", workspaceId, normalizedQuery],
    queryFn: () => searchService.globalSearch(workspaceId, normalizedQuery),
    enabled: normalizedQuery.length > 0,
    retry: false,
  })
}
