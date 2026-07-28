export interface SearchResult {
  id: string
  title: string
  subtitle: string
  category: "Documents" | "Files" | "Members" | "Workspaces" | "Settings" | "Commands"
  type: "document" | "file" | "member" | "workspace" | "setting" | "command"
  navigationTarget: string
  metadata?: Record<string, any>
  keywords?: string[]
}

export interface SearchService {
  globalSearch(workspaceId: string, query: string): Promise<SearchResult[]>
}