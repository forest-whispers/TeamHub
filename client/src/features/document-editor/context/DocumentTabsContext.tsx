import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"

export interface TabMetadata {
  id: string
  title: string
  icon?: string | null
  workspaceId: string
  content?: any
  savedContent?: any
  isDirty?: boolean
}

interface DocumentTabsContextType {
  openTabs: TabMetadata[]
  activeTabId: string | null
  openTab: (id: string, title: string, workspaceId: string, icon?: string | null) => void
  closeTab: (id: string) => void
  updateTabName: (id: string, title: string) => void
  updateTabContent: (id: string, content: any, savedContent: any, isDirty: boolean) => void
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

  const openTab = useCallback((id: string, title: string, workspaceId: string, icon?: string | null) => {
    setOpenTabs((prev) => {
      const exists = prev.some((tab) => tab.id === id)
      if (exists) return prev
      return [...prev, { id, title, workspaceId, icon }]
    })
    setActiveTabId(id)
  }, [])

  const updateTabName = useCallback((id: string, title: string) => {
    setOpenTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, title } : tab))
    )
  }, [])

  const updateTabContent = useCallback((id: string, _content: any, _savedContent: any, isDirty: boolean) => {
    setOpenTabs((prev) => {
      const existing = prev.find((tab) => tab.id === id)
      if (existing && existing.isDirty === isDirty) {
        return prev
      }
      return prev.map((tab) => (tab.id === id ? { ...tab, isDirty } : tab))
    })
  }, [])

  const closeTab = useCallback((id: string) => {
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
  }, [activeTabId, location.pathname, navigate])

  return (
    <DocumentTabsContext.Provider value={{ openTabs, activeTabId, openTab, closeTab, updateTabName, updateTabContent }}>
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