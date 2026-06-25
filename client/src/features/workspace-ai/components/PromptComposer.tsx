import { useRef, useEffect } from "react"
import { Send, CornerDownLeft } from "lucide-react"

interface PromptComposerProps {
  value: string
  onChange: (val: string) => void
  onSubmit: () => void
  disabled?: boolean
}

export function PromptComposer({ value, onChange, onSubmit, disabled }: PromptComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea heights
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (value.trim() && !disabled) {
        onSubmit()
      }
    }
  }

  return (
    <div className="p-3 border-t border-border bg-card shrink-0">
      <div className="relative flex items-end gap-2 border border-input rounded-xl bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Workspace AI..."
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent resize-none text-sm outline-none placeholder:text-muted-foreground min-h-[20px] max-h-[120px] py-1 disabled:cursor-not-allowed"
        />
        <div className="flex items-center gap-1.5 shrink-0 select-none pb-0.5">
          <span className="hidden sm:inline-flex text-[9px] text-muted-foreground/50 gap-0.5 items-center mr-0.5 font-semibold">
            <span>Enter</span>
            <CornerDownLeft className="size-2.5" />
          </span>
          <button
            onClick={onSubmit}
            disabled={!value.trim() || disabled}
            className={`p-1.5 rounded-lg text-primary-foreground transition-all cursor-pointer ${
              value.trim() && !disabled
                ? "bg-primary hover:bg-primary/90 shadow-sm active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            title="Send query"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
