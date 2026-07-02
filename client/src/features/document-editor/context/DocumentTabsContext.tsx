import React, { createContext, useContext, useState, useEffect } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"

export interface TabMetadata {
  id: string
  title: string
  workspaceId: string
}

interface DocumentTabsContextType {
  openTabs: TabMetadata[]
  activeTabId: string | null
  openTab: (id: string, title: string, workspaceId: string) => void
  closeTab: (id: string) => void
  updateTabName: (id: string, title: string) => void
}

const DocumentTabsContext = createContext<DocumentTabsContextType | undefined>(undefined)

export function DocumentTabsProvider({ children }: { children: React.ReactNode }) {
  const [openTabs, setOpenTabs] = useState<TabMetadata[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { workspaceId } = useParams<{ workspaceId: string }>()

  // Clear tabs when workspaceId changes
  useEffect(() => {
    setOpenTabs([])
    setActiveTabId(null)
  }, [workspaceId])

  const openTab = (id: string, title: string, workspaceId: string) => {
    setOpenTabs((prev) => {
      const exists = prev.some((tab) => tab.id === id)
      if (exists) return prev
      return [...prev, { id, title, workspaceId }]
    })
    setActiveTabId(id)
  }

  const updateTabName = (id: string, title: string) => {
    setOpenTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, title } : tab))
    )
  }

  const closeTab = (id: string) => {
    setOpenTabs((prev) => {
      const tabIndex = prev.findIndex((tab) => tab.id === id)
      if (tabIndex === -1) return prev

      const nextTabs = prev.filter((tab) => tab.id !== id)
      const closedTab = prev[tabIndex]

      // If we are closing the active tab, we need to switch focus
      if (id === activeTabId) {
        // Only navigate if the user is currently viewing the closed tab
        const isCurrentlyOnThisDoc = location.pathname === `/workspace/${closedTab.workspaceId}/documents/${id}`

        if (isCurrentlyOnThisDoc) {
          if (nextTabs.length > 0) {
            // Prioritize left adjacent tab, fallback to right adjacent
            const nextActiveIndex = Math.max(0, tabIndex - 1)
            const nextActiveTab = nextTabs[nextActiveIndex]
            setActiveTabId(nextActiveTab.id)
            navigate(`/workspace/${nextActiveTab.workspaceId}/documents/${nextActiveTab.id}`)
          } else {
            setActiveTabId(null)
            navigate(`/workspace/${closedTab.workspaceId}/documents`)
          }
        } else {
          // Just update the active tab ID state without navigating
          if (nextTabs.length > 0) {
            const nextActiveIndex = Math.max(0, tabIndex - 1)
            setActiveTabId(nextTabs[nextActiveIndex].id)
          } else {
            setActiveTabId(null)
          }
        }
      }

      return nextTabs
    })
  }

  return (
    <DocumentTabsContext.Provider value={{ openTabs, activeTabId, openTab, closeTab, updateTabName }}>
      {children}
    </DocumentTabsContext.Provider>
  )
}

export function useDocumentTabs() {
  const context = useContext(DocumentTabsContext)
  if (context === undefined) {
    throw new Error("useDocumentTabs must be used within a DocumentTabsProvider")
  }
  return context
}