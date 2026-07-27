import { useEffect, useRef } from "react"
import type { Message } from "../types"
import { MessageItem } from "./MessageItem"

interface MessageListProps {
  messages: Message[]
  currentUserId?: string
  isAdmin?: boolean
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  onReply?: (message: Message) => void
  onEdit?: (messageId: string, content: string) => void
  onDelete?: (messageId: string) => void
  onPin?: (messageId: string) => void
  onUnpin?: (messageId: string) => void
  onToggleReaction?: (messageId: string, emoji: string) => void
}

export function MessageList({
  messages,
  currentUserId,
  isAdmin,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
  onToggleReaction,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (messages.length === 0) return
    const lastMessage = messages[messages.length - 1]
    
    // Scroll to the bottom only if the newest message at the end changed
    if (lastMessage.id !== lastMessageIdRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
      lastMessageIdRef.current = lastMessage.id
    }
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
      {/* Pagination trigger at the top */}
      {hasMore && (
        <div className="flex justify-center py-2 shrink-0 select-none">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="text-[10px] text-primary hover:underline font-semibold bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoadingMore ? "Loading previous messages..." : "Load previous messages"}
          </button>
        </div>
      )}

      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onPin={onPin}
          onUnpin={onUnpin}
          onToggleReaction={onToggleReaction}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}