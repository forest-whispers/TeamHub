import { useState, useEffect } from "react"
import { Command } from "cmdk"
import { useNavigate, useParams } from "react-router-dom"
import { useGlobalSearch } from "../hooks/useGlobalSearch"
import { SearchResultItem } from "./SearchResultItem"
import { RecentSearchList } from "./RecentSearchList"
import type { SearchResult } from "../types"

interface GlobalCommandPaletteProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const RECENT_SEARCHES_KEY = "teamhub-recent-searches"

export function GlobalCommandPalette({ isOpen, setIsOpen }: GlobalCommandPaletteProps) {
  const navigate = useNavigate()
  const { workspaceId: urlWorkspaceId } = useParams<{ workspaceId: string }>()
  const workspaceId = urlWorkspaceId || "ws-1"

  const [query, setQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Load recent searches when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
        setRecentSearches(stored ? JSON.parse(stored) : [])
      } catch {
        setRecentSearches([])
      }
    }
  }, [isOpen])

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, setIsOpen])

  // Fetch results from TanStack Query
  const { data: results = [], isLoading, isError, error, refetch } = useGlobalSearch(
    workspaceId,
    query,
    250 // configurable debounce duration (250ms)
  )

  if (!isOpen) return null

  // Save query to LocalStorage recent searches
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      let list: string[] = stored ? JSON.parse(stored) : []
      const normalized = trimmed.toLowerCase()

      // Remove existing matches to move to top
      list = list.filter((item) => item.toLowerCase() !== normalized)
      list.unshift(trimmed)
      list = list.slice(0, 5) // Keep up to 5 items

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list))
      setRecentSearches(list)
    } catch (e) {
      console.error("Failed to save recent search:", e)
    }
  }

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    if (query.trim()) {
      saveRecentSearch(query)
    }
    setIsOpen(false)
    navigate(result.navigationTarget)
  }

  // Handle select recent search
  const handleSelectRecent = (recentQuery: string) => {
    setQuery(recentQuery)
  }

  // Handle clear recent searches
  const handleClearRecent = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
      setRecentSearches([])
    } catch (e) {
      console.error("Failed to clear recent searches:", e)
    }
  }

  const showRecentList = !query.trim() && recentSearches.length > 0
  const showResults = query.trim().length > 0 && !isLoading && !isError
  const categories: SearchResult["category"][] = ["Documents", "Members", "Workspaces", "Settings", "Commands"]

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} label="Command Menu" className="flex flex-col">
          <div className="flex items-center border-b border-border px-3 py-2">
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search documents, members, settings, workspaces..."
              className="flex h-10 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="ml-2 rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              ESC
            </button>
          </div>

          <Command.List className="max-h-[350px] overflow-y-auto p-2">
            {/* Loading state skeleton */}
            {isLoading && query.trim().length > 0 && (
              <div className="p-4 space-y-3.5 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-10 bg-muted/60 rounded-lg w-full"></div>
                  <div className="h-10 bg-muted/60 rounded-lg w-full"></div>
                  <div className="h-10 bg-muted/60 rounded-lg w-full"></div>
                </div>
              </div>
            )}

            {/* Error state */}
            {isError && query.trim().length > 0 && (
              <div className="py-8 px-4 text-center">
                <p className="text-sm text-destructive mb-3.5">
                  {error instanceof Error ? error.message : "Failed to load results."}
                </p>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 focus:outline-none cursor-pointer transition-colors"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Recent Searches */}
            {showRecentList && (
              <RecentSearchList
                items={recentSearches}
                onSelect={handleSelectRecent}
                onClear={handleClearRecent}
              />
            )}

            {/* Empty state when query matches nothing */}
            {showResults && results.length === 0 && (
              <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
                No results found for "{query}".
              </Command.Empty>
            )}

            {/* Results categorized list */}
            {showResults &&
              results.length > 0 &&
              categories.map((category) => {
                const categoryResults = results.filter((r) => r.category === category)
                if (categoryResults.length === 0) return null

                return (
                  <Command.Group
                    key={category}
                    heading={category}
                    className="overflow-hidden p-1 text-xs font-medium text-muted-foreground"
                  >
                    {categoryResults.map((result) => (
                      <SearchResultItem
                        key={result.id}
                        result={result}
                        onSelect={handleSelectResult}
                      />
                    ))}
                  </Command.Group>
                )
              })}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
