import { useState, useRef, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { useCreateDiscussion } from "../hooks/useDiscussions"
import { MessageSquarePlus, X, Loader2 } from "lucide-react"

export interface ComposerAnchorState {
  from: number
  to: number
  quotedText: string
  top?: number
  left?: number
}

interface DiscussionComposerProps {
  workspaceId: string
  documentId: string
  composerState: ComposerAnchorState
  onClose: () => void
  onSuccess: (createdDiscussionId: string) => void
}

export function DiscussionComposer({
  workspaceId,
  documentId,
  composerState,
  onClose,
  onSuccess,
}: DiscussionComposerProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const createMutation = useCreateDiscussion(workspaceId, documentId)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || createMutation.isPending) return

    const payload = {
      anchor: {
        version: 1,
        type: "text_quote",
        from: composerState.from,
        to: composerState.to,
        quotedText: composerState.quotedText,
      },
      quotedText: composerState.quotedText,
      message: trimmed,
    }

    createMutation.mutate(payload, {
      onSuccess: (created) => {
        setMessage("")
        onSuccess(created.id)
      },
    })
  }

  return (
    <div
      className="absolute top-3 right-3 sm:top-4 sm:right-4 w-80 max-w-[calc(100vw-2rem)] bg-popover text-popover-foreground border border-border shadow-xl rounded-xl p-3.5 space-y-3 z-40 text-left animate-in fade-in-50 slide-in-from-top-2 duration-150 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <MessageSquarePlus className="size-3.5 text-primary" />
          <span>New Discussion</span>
        </div>
        <button
          onClick={onClose}
          disabled={createMutation.isPending}
          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted cursor-pointer transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Quoted snippet */}
      <div className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2 py-1 bg-muted/40 rounded-r max-h-20 overflow-y-auto">
        "{composerState.quotedText}"
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Start a discussion..."
          disabled={createMutation.isPending}
          className="w-full text-xs p-2 rounded-md bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none min-h-[70px] text-foreground placeholder:text-muted-foreground"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              handleSubmit(e)
            }
          }}
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Ctrl + Enter to send</span>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="xs"
              disabled={!message.trim() || createMutation.isPending}
              className="cursor-pointer text-xs"
            >
              {createMutation.isPending && <Loader2 className="size-3 animate-spin mr-1" />}
              Comment
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}