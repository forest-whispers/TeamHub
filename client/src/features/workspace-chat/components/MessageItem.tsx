import { useState, useEffect } from "react"
import type { Message } from "../types"
import { Smile, Reply, Pin, PinOff, Edit2, Trash2 } from "lucide-react"

interface MessageItemProps {
  message: Message
  currentUserId?: string
  isAdmin?: boolean
  onReply?: (message: Message) => void
  onEdit?: (messageId: string, content: string) => void
  onDelete?: (messageId: string) => void
  onPin?: (messageId: string) => void
  onUnpin?: (messageId: string) => void
  onToggleReaction?: (messageId: string, emoji: string) => void
  highlightedMessageId?: string | null
  onClearHighlight?: () => void
}

export function MessageItem({
  message,
  currentUserId,
  isAdmin,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
  onToggleReaction,
  highlightedMessageId,
  onClearHighlight,
}: MessageItemProps) {
  const isSelf = Boolean(currentUserId && message.sender.id === currentUserId)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const emojis = ["👍", "❤️", "😂", "😮", "😢", "🎉"] as const

  const getAvatarBgColor = (name: string) => {
    const colors = [
      "bg-red-500/10 text-red-500 border-red-500/20",
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "bg-green-500/10 text-green-500 border-green-500/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-teal-500/10 text-teal-500 border-teal-500/20",
      "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      "bg-sky-500/10 text-sky-500 border-sky-500/20",
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "bg-violet-500/10 text-violet-500 border-violet-500/20",
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
      "bg-pink-500/10 text-pink-500 border-pink-500/20",
      "bg-rose-500/10 text-rose-500 border-rose-500/20",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (!trimmed) {
      setIsEditing(false);
      setEditText(message.content);
      return;
    }
    if (trimmed !== message.content) {
      onEdit?.(message.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleBlur = () => {
    handleSaveEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditText(message.content);
    }
  };

  useEffect(() => {
    if (highlightedMessageId === message.id) {
      const timer = setTimeout(() => {
        onClearHighlight?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedMessageId, message.id, onClearHighlight]);

  const renderMessageContent = (content: string) => {
    const regex = /(@[a-zA-Z0-9_.-]+)/g;
    const parts = content.split(regex);
    return parts.map((part, index) => {
      if (part.match(regex)) {
        return (
          <span
            key={index}
            className={`font-semibold underline ${
              isSelf
                ? "text-sky-200 hover:text-sky-100"
                : "text-primary hover:text-primary/80"
            }`}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const renderAvatar = () => {
    if (message.sender.avatar) {
      return (
        <img
          src={message.sender.avatar}
          alt={message.sender.name}
          className="size-7 rounded-full shrink-0 select-none object-cover border border-border/30"
        />
      )
    }

    return (
      <div
        className={`size-7 rounded-full flex items-center justify-center font-bold text-[10px] border shrink-0 select-none ${getAvatarBgColor(
          message.sender.name
        )}`}
      >
        {getInitials(message.sender.name)}
      </div>
    )
  }

  const renderToolbar = () => (
    <div
      className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-card border border-border shadow-md rounded-md p-1 z-10 absolute top-1/2 -translate-y-1/2 ${
        isSelf ? "right-[calc(100%+8px)]" : "left-[calc(100%+8px)]"
      }`}
    >
      {/* Emoji Trigger */}
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
          title="React"
        >
          <Smile className="size-3.5" />
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-6 left-0 bg-card border border-border shadow-lg rounded-full p-1.5 flex gap-1 z-20 animate-in fade-in slide-in-from-bottom-1 duration-150">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onToggleReaction?.(message.id, emoji)
                  setShowEmojiPicker(false)
                }}
                className="hover:scale-125 transition-transform px-1 cursor-pointer text-xs"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply */}
      <button
        onClick={() => onReply?.(message)}
        className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
        title="Reply"
      >
        <Reply className="size-3.5" />
      </button>

      {/* Pin/Unpin */}
      {isAdmin && (
        <button
          onClick={() => (message.isPinned ? onUnpin?.(message.id) : onPin?.(message.id))}
          className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
          title={message.isPinned ? "Unpin message" : "Pin message"}
        >
          {message.isPinned ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
        </button>
      )}

      {/* Edit */}
      {isSelf && (
        <button
          onClick={() => {
            setIsEditing(true)
            setEditText(message.content)
          }}
          className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
          title="Edit"
        >
          <Edit2 className="size-3.5" />
        </button>
      )}

      {/* Delete */}
      {isSelf && (
        <button
          onClick={() => onDelete?.(message.id)}
          className="p-1 hover:bg-muted text-destructive rounded-md transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  )

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null

    // Group reactions by emoji
    const emojiGroups = message.reactions.reduce((acc, current) => {
      acc[current.emoji] = acc[current.emoji] || []
      acc[current.emoji].push(current)
      return acc
    }, {} as Record<string, typeof message.reactions>)

    return (
      <div className={`flex flex-wrap gap-1 mt-1 ${isSelf ? "justify-end" : "justify-start"}`}>
        {Object.entries(emojiGroups).map(([emoji, group]) => {
          const count = group.length
          const hasReacted = group.some((r) => r.userId === currentUserId)

          return (
            <button
              key={emoji}
              onClick={() => onToggleReaction?.(message.id, emoji)}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium transition-colors cursor-pointer select-none ${
                hasReacted
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          )
        })}
      </div>
    )
  }

  const renderReplyHeader = () => {
    if (!message.replyTo) return null

    return (
      <div className="text-[10px] text-muted-foreground bg-muted/30 border-l-2 border-primary/45 px-2 py-1 mb-1 rounded-r-md max-w-full truncate text-left flex items-center gap-1.5">
        <Reply className="size-2.5 shrink-0 text-muted-foreground/60" />
        <span className="font-semibold">{message.replyTo.sender.name}:</span>
        <span className="truncate">{message.replyTo.content}</span>
      </div>
    )
  }

  if (isSelf) {
    const isHighlighted = highlightedMessageId === message.id;
    return (
      <div
        id={`chat-message-${message.id}`}
        className={`flex flex-row-reverse gap-2.5 text-right items-start py-2 select-text group justify-start relative transition-all duration-500 px-2 rounded-lg ${
          isHighlighted ? "ring-2 ring-primary bg-primary/5 shadow-md scale-[1.01]" : ""
        }`}
      >
        {/* Avatar */}
        {renderAvatar()}

        {/* Message Info and Content */}
        <div className="min-w-0 max-w-[75%] flex flex-col items-end">
          <div className="flex items-baseline gap-2 flex-row-reverse text-right mb-1">
            <span className="font-semibold text-xs text-foreground truncate select-none">
              {message.sender.name} (You)
            </span>
            <span className="text-[9px] text-muted-foreground select-none">
              {formatTimestamp(message.createdAt)}
            </span>
            {message.isEdited && (
              <span className="text-[9px] text-muted-foreground/60 select-none italic">
                (edited)
              </span>
            )}
          </div>

          {/* Reply parent message context */}
          {renderReplyHeader()}

          {/* Message bubble */}
          {isEditing ? (
            <div className="w-full mt-1 text-left relative">
              <textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full pl-3 pr-3 pt-3 pb-5.5 text-xs border border-primary/20 rounded-2xl bg-background text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/45 resize-none leading-relaxed shadow-sm focus:shadow-md transition-all duration-200"
                rows={2.5}
              />
              <div className="absolute right-3.5 bottom-2 text-[8px] text-muted-foreground/60 select-none pointer-events-none">
                Esc to cancel • Enter to save
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-xs text-xs leading-relaxed whitespace-pre-wrap text-left shadow-xs">
                {renderMessageContent(message.content)}
              </div>
              {!isEditing && renderToolbar()}
            </div>
          )}

          {/* Pinned badge */}
          {message.isPinned && (
            <div className="flex items-center gap-1 text-[9px] text-amber-500 font-medium mt-1 select-none">
              <Pin className="size-2.5 fill-amber-500 shrink-0" />
              <span>Pinned by {message.pinnedBy?.name || "Admin"}</span>
            </div>
          )}

          {/* Reactions list */}
          {renderReactions()}
        </div>

      </div>
    )
  }

  const isHighlighted = highlightedMessageId === message.id;
  return (
    <div
      id={`chat-message-${message.id}`}
      className={`flex gap-2.5 text-left items-start py-2 select-text group relative transition-all duration-500 px-2 rounded-lg ${
        isHighlighted ? "ring-2 ring-primary bg-primary/5 shadow-md scale-[1.01]" : ""
      }`}
    >
      {/* Avatar */}
      {renderAvatar()}

      {/* Message Info and Content */}
      <div className="min-w-0 max-w-[75%]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-xs text-foreground truncate select-none">
            {message.sender.name}
          </span>
          <span className="text-[9px] text-muted-foreground select-none">
            {formatTimestamp(message.createdAt)}
          </span>
          {message.isEdited && (
            <span className="text-[9px] text-muted-foreground/60 select-none italic">
              (edited)
            </span>
          )}
        </div>

        {/* Reply parent message context */}
        {renderReplyHeader()}

        {/* Message bubble */}
        <div className="relative">
          <div className="bg-muted/60 text-foreground border border-border/40 p-3 rounded-2xl rounded-tl-xs text-xs leading-relaxed whitespace-pre-wrap">
            {renderMessageContent(message.content)}
          </div>
          {renderToolbar()}
        </div>

        {/* Pinned badge */}
        {message.isPinned && (
          <div className="flex items-center gap-1 text-[9px] text-amber-500 font-medium mt-1 select-none">
            <Pin className="size-2.5 fill-amber-500 shrink-0" />
            <span>Pinned by {message.pinnedBy?.name || "Admin"}</span>
          </div>
        )}

        {/* Reactions list */}
        {renderReactions()}
      </div>

    </div>
  )
}