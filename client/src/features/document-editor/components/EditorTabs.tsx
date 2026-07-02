import { useDocumentTabs } from "../context/DocumentTabsContext"
import { useNavigate } from "react-router-dom"
import { X, FileText } from "lucide-react"

export function EditorTabs() {
  const { openTabs, activeTabId, closeTab } = useDocumentTabs()
  const navigate = useNavigate()

  if (openTabs.length === 0) return null

  return (
    <div className="flex border-b border-border bg-muted/40 overflow-x-auto select-none scrollbar-none shrink-0 h-10 text-left">
      {openTabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            onClick={() => navigate(`/workspace/${tab.workspaceId}/documents/${tab.id}`)}
            className={`flex items-center gap-2 px-4 py-2 border-r border-border text-xs font-semibold cursor-pointer transition-all relative h-full shrink-0 ${
              isActive
                ? "bg-background text-foreground border-t-2 border-t-primary"
                : "text-muted-foreground bg-muted/20 hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            <FileText className="size-3.5 shrink-0" />
            <span className="truncate max-w-30">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
              className="p-0.5 rounded-sm hover:bg-muted hover:text-foreground text-muted-foreground/80 cursor-pointer transition-colors"
              title="Close Tab"
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}