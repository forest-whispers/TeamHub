import { Plus, MessageSquare, Pin } from "lucide-react"
import type { ConversationMetadata } from "../types"

interface ConversationListProps {
  conversations: ConversationMetadata[]
  activeId?: string
  onSelect: (id: string) => void
  onCreateNew: () => void
  isCreating?: boolean
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onCreateNew,
  isCreating,
}: ConversationListProps) {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    } catch {
      return ""
    }
  }

  return (
    <div className="w-48 sm:w-56 border-r border-border bg-muted/10 flex flex-col h-full overflow-hidden shrink-0 select-none">
      {/* Sidebar New Chat button */}
      <div className="p-3 border-b border-border shrink-0">
        <button
          onClick={onCreateNew}
          disabled={isCreating}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-border bg-card hover:bg-accent text-xs font-semibold rounded-lg text-foreground shadow-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="size-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations history list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 text-left">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
          History
        </div>
        {conversations.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground/50 leading-relaxed">
            No chats started.
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeId
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                  isActive
                    ? "bg-card text-primary font-semibold shadow-sm border border-border"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-transparent"
                }`}
              >
                <MessageSquare className="size-3.5 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium leading-normal">{conv.title}</div>
                  <div className="text-[9px] text-muted-foreground/60 mt-0.5 flex items-center justify-between">
                    <span>{formatDate(conv.createdAt)}</span>
                    {conv.metadata?.pinned && <Pin className="size-2.5 text-primary rotate-45 shrink-0" />}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
