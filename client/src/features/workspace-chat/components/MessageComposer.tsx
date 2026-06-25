import { useState, useRef } from "react"
import type { KeyboardEvent } from "react"
import { Paperclip, Smile, SendHorizontal } from "lucide-react"

interface MessageComposerProps {
  onSend: (content: string) => void
  isSending: boolean
}

export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const handleSend = () => {
    if (!content.trim() || isSending) return
    onSend(content.trim())
    setContent("")
    // Reset height of textarea
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

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="p-4 border-t border-border bg-card shrink-0 select-none">
      <div className="border border-input rounded-lg bg-background/50 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-all duration-150 overflow-hidden">
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          className="w-full resize-none bg-transparent outline-none px-3 py-2.5 text-xs text-foreground min-h-[40px] max-h-[160px] leading-relaxed overflow-y-auto block"
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

            {/* Emoji placeholder button */}
            <button
              type="button"
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              title="Insert emoji (placeholder)"
            >
              <Smile className="size-4" />
            </button>
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
