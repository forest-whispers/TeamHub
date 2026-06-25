import type { SearchResult } from "../types"
import { getMockDocuments } from "@/features/workspace-documents/mock/mockDocuments"
import { getMockWorkspaceMembers } from "@/features/workspace-members/mock/mockWorkspaceMembers"
import { getMockWorkspaces } from "@/features/dashboard/mock/mockDashboard"

// Static settings items definition
const SETTINGS_ITEMS = [
  {
    id: "general",
    name: "General Settings",
    subPath: "settings",
    keywords: ["settings", "general", "name", "theme", "logo", "configure"],
  },
  {
    id: "members",
    name: "Members & Permissions",
    subPath: "members",
    keywords: ["members", "roles", "invite", "users", "permissions", "team"],
  },
  {
    id: "files",
    name: "Files & Storage",
    subPath: "files",
    keywords: ["files", "storage", "assets", "uploads", "images"],
  },
  {
    id: "activity",
    name: "Activity Log",
    subPath: "activity",
    keywords: ["activity", "audit", "logs", "history", "changes"],
  },
  {
    id: "analytics",
    name: "Analytics Dashboard",
    subPath: "analytics",
    keywords: ["analytics", "statistics", "metrics", "reports", "insights"],
  },
  {
    id: "chat",
    name: "Live Chat",
    subPath: "chat",
    keywords: ["chat", "messages", "communication", "channel", "slack"],
  },
]

// Static commands items definition
const COMMANDS_ITEMS = [
  {
    id: "dashboard",
    name: "Go to Dashboard",
    target: "/dashboard",
    keywords: ["dashboard", "home", "workspaces", "landing"],
    metadata: { action: "navigate" },
  },
  {
    id: "create-workspace",
    name: "Create Workspace",
    target: "/dashboard?action=create",
    keywords: ["create", "new", "workspace", "add"],
    metadata: { action: "create-workspace" },
  },
  {
    id: "join-workspace",
    name: "Join Workspace",
    target: "/dashboard?action=join",
    keywords: ["join", "code", "enter", "workspace"],
    metadata: { action: "join-workspace" },
  },
  {
    id: "logout",
    name: "Log Out",
    target: "/login",
    keywords: ["logout", "exit", "signout", "quit"],
    metadata: { action: "logout" },
  },
]

export async function mockGlobalSearch(workspaceId: string, query: string): Promise<SearchResult[]> {
  // Simulate additional latency if needed or let localStorage error trigger
  if (localStorage.getItem("teamhub-mock-search-error") === "true") {
    // Add small mock latency before throwing error to see skeleton loader
    await new Promise((resolve) => setTimeout(resolve, 300))
    throw new Error("Failed to execute search query. Please try again.")
  }

  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return []
  }

  // Fetch mock data in parallel to capture real changes
  const [documents, members, workspaces] = await Promise.all([
    getMockDocuments(workspaceId).catch(() => []),
    getMockWorkspaceMembers(workspaceId).catch(() => []),
    getMockWorkspaces().catch(() => []),
  ])

  const results: SearchResult[] = []

  // 1. Filter and map Documents
  documents.forEach((doc) => {
    const keywords = [doc.name.toLowerCase(), doc.lastEditedBy.toLowerCase(), "document", "editor"]
    const matches =
      doc.name.toLowerCase().includes(normalizedQuery) ||
      doc.lastEditedBy.toLowerCase().includes(normalizedQuery)

    if (matches) {
      results.push({
        id: `doc-${doc.id}`,
        title: doc.name,
        subtitle: `Last edited ${doc.lastEdited} by ${doc.lastEditedBy}`,
        category: "Documents",
        type: "document",
        navigationTarget: `/workspace/${workspaceId}/documents/${doc.id}`,
        metadata: { documentId: doc.id, workspaceId },
        keywords,
      })
    }
  })

  // 2. Filter and map Members
  members.forEach((member) => {
    const keywords = [member.name.toLowerCase(), member.email.toLowerCase(), member.role.toLowerCase(), "member", "user"]
    const matches =
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.email.toLowerCase().includes(normalizedQuery) ||
      member.role.toLowerCase().includes(normalizedQuery)

    if (matches) {
      results.push({
        id: `member-${member.id}`,
        title: member.name,
        subtitle: `${member.role} • ${member.status}`,
        category: "Members",
        type: "member",
        navigationTarget: `/workspace/${workspaceId}/members?memberId=${member.id}`,
        metadata: { memberId: member.id, workspaceId },
        keywords,
      })
    }
  })

  // 3. Filter and map Workspaces
  workspaces.forEach((ws) => {
    const keywords = [ws.name.toLowerCase(), ws.description?.toLowerCase() || "", "workspace", "team"]
    const matches =
      ws.name.toLowerCase().includes(normalizedQuery) ||
      ws.description?.toLowerCase().includes(normalizedQuery)

    if (matches) {
      results.push({
        id: `workspace-${ws.id}`,
        title: ws.name,
        subtitle: `${ws.memberCount} members • ${ws.documentCount} documents`,
        category: "Workspaces",
        type: "workspace",
        navigationTarget: `/workspace/${ws.id}/home`,
        metadata: { workspaceId: ws.id },
        keywords,
      })
    }
  })

  // 4. Filter and map Settings
  SETTINGS_ITEMS.forEach((item) => {
    const matches =
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some((k) => k.toLowerCase().includes(normalizedQuery))

    if (matches) {
      results.push({
        id: `setting-${item.id}`,
        title: item.name,
        subtitle: `Configure ${item.name.toLowerCase()}`,
        category: "Settings",
        type: "setting",
        navigationTarget: `/workspace/${workspaceId}/${item.subPath}`,
        metadata: { workspaceId, section: item.id },
        keywords: item.keywords,
      })
    }
  })

  // 5. Filter and map Commands
  COMMANDS_ITEMS.forEach((item) => {
    const matches =
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.keywords.some((k) => k.toLowerCase().includes(normalizedQuery))

    if (matches) {
      results.push({
        id: `command-${item.id}`,
        title: item.name,
        subtitle: `Run ${item.name.toLowerCase()} command`,
        category: "Commands",
        type: "command",
        navigationTarget: item.target,
        metadata: item.metadata,
        keywords: item.keywords,
      })
    }
  })

  return results
}
