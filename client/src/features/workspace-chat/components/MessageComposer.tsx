import { useState, useRef, useEffect } from "react"
import type { KeyboardEvent } from "react"
import { Paperclip, Smile, SendHorizontal, X, CornerDownRight } from "lucide-react"
import type { Message } from "../types"

interface Member {
  id: string
  name: string
}

interface MessageComposerProps {
  onSend: (content: string, replyToId?: string, mentionedUserIds?: string[]) => void
  isSending: boolean
  onTyping?: (isTyping: boolean) => void
  replyingTo: Message | null
  onCancelReply?: () => void
  members?: Member[]
  placeholder?: string
}

export function MessageComposer({
  onSend,
  isSending,
  onTyping,
  replyingTo,
  onCancelReply,
  members = [],
  placeholder = "Type a message... (Use @ to mention. Enter to send, Shift+Enter for new line)",
}: MessageComposerProps) {
  const [content, setContent] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [mentionSearch, setMentionSearch] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleSend = () => {
    if (!content.trim() || isSending) return

    // Stop typing indicator immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    isTypingRef.current = false
    onTyping?.(false)

    // Scan for mentioned users
    const mentionedUserIds: string[] = []
    members.forEach((member) => {
      const regex = new RegExp(`@${member.name}\\b`, "gi")
      if (regex.test(content)) {
        mentionedUserIds.push(member.id)
      }
    })

    onSend(content.trim(), replyingTo?.id, mentionedUserIds)
    setContent("")
    setMentionSearch(null)

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextChange = (val: string) => {
    setContent(val)

    // Trigger typing event
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onTyping?.(true)
    }

    // Reset debounce timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      onTyping?.(false)
    }, 2000)

    // Check cursor position for mentions suggestion trigger
    if (textareaRef.current) {
      const selStart = textareaRef.current.selectionStart
      const textBeforeCursor = val.substring(0, selStart)
      const lastAtIdx = textBeforeCursor.lastIndexOf("@")

      if (lastAtIdx !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIdx + 1)
        if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
          setMentionSearch(textAfterAt.toLowerCase())
          return
        }
      }
    }
    setMentionSearch(null)
  }

  const handleSelectMention = (member: Member) => {
    if (textareaRef.current) {
      const selStart = textareaRef.current.selectionStart
      const textBefore = content.substring(0, selStart)
      const lastAtIdx = textBefore.lastIndexOf("@")
      if (lastAtIdx !== -1) {
        const newText =
          content.substring(0, lastAtIdx) +
          `@${member.name} ` +
          content.substring(textareaRef.current.selectionEnd)
        setContent(newText)
        setMentionSearch(null)
        textareaRef.current.focus()
      }
    }
  }

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const filteredMembers = mentionSearch !== null
    ? members.filter((m) => m.name.toLowerCase().includes(mentionSearch))
    : []

  return (
    <div className="p-4 border-t border-border bg-card shrink-0 select-none relative">
      {/* Mentions Autocomplete suggestions box */}
      {mentionSearch !== null && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-4 mb-1.5 w-56 bg-card border border-border rounded-lg shadow-lg max-h-36 overflow-y-auto p-1 z-30 select-none animate-in fade-in slide-in-from-bottom-2 duration-150 text-left">
          <div className="text-[9px] text-muted-foreground font-bold px-2 py-1 border-b border-border/40 mb-1">
            Mention Member
          </div>
          {filteredMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => handleSelectMention(member)}
              className="w-full text-left px-2 py-1.5 text-[11px] rounded hover:bg-muted text-foreground font-medium transition-colors block cursor-pointer"
            >
              @{member.name}
            </button>
          ))}
        </div>
      )}

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-muted/65 border border-border rounded-t-lg text-[10px] text-muted-foreground border-b-0 animate-in slide-in-from-bottom-1 duration-150 text-left">
          <div className="flex items-center gap-1.5 truncate">
            <CornerDownRight className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">Replying to {replyingTo.sender.name}:</span>
            <span className="truncate italic">"{replyingTo.content}"</span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-0.5 hover:bg-muted-foreground/10 rounded cursor-pointer shrink-0 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <div className={`border border-input bg-background/50 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all duration-150 overflow-hidden ${
        replyingTo ? "rounded-b-lg border-t-0" : "rounded-lg"
      }`}>
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent outline-none px-3 py-2.5 text-xs text-foreground min-h-10 max-h-40 leading-relaxed overflow-y-auto block"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 bg-background/30 shrink-0">
          <div className="flex items-center gap-1">
            {/* Attachment placeholder button */}
            <button
              type="button"
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              title="Add attachment (placeholder)"
            >
              <Paperclip className="size-4" />
            </button>

            {/* Emoji button with functional picker popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer ${
                  showEmojiPicker ? "bg-muted text-foreground" : ""
                }`}
                title="Insert emoji"
              >
                <Smile className="size-4" />
              </button>

              {showEmojiPicker && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowEmojiPicker(false)}
                  />
                  <div className="absolute bottom-8 left-0 bg-card border border-border shadow-lg rounded-lg p-2 grid grid-cols-6 gap-1 z-40 w-44 animate-in fade-in slide-in-from-bottom-1 duration-150">
                    {["👍", "❤️", "😂", "😮", "😢", "🎉", "😊", "🔥", "🚀", "💡", "👏", "✅"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setContent((prev) => prev + emoji)
                          setShowEmojiPicker(false)
                          textareaRef.current?.focus()
                        }}
                        className="hover:bg-muted rounded p-1 transition-colors cursor-pointer text-sm text-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() || isSending}
            className="p-1.5 bg-primary text-primary-foreground hover:bg-primary/95 disabled:bg-primary/50 disabled:text-primary-foreground/50 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
            title="Send Message"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}