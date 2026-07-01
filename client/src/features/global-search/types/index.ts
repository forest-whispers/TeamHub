export interface SearchResult {
  id: string
  title: string
  subtitle: string
  category: "Documents" | "Members" | "Workspaces" | "Settings" | "Commands"
  type: "document" | "member" | "workspace" | "setting" | "command"
  navigationTarget: string
  metadata?: Record<string, any>
  keywords?: string[]
}

export interface SearchService {
  globalSearch(workspaceId: string, query: string): Promise<SearchResult[]>
}