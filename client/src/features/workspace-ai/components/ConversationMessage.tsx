import { Sparkles, AlertCircle, RefreshCw } from "lucide-react"
import type { Message } from "../types"

interface ConversationMessageProps {
  message: Message
  onRetry?: (message: Message) => void
}

export function ConversationMessage({ message, onRetry }: ConversationMessageProps) {
  const isUser = message.role === "user"
  const isSending = message.status === "sending"
  const isFailed = message.status === "failed"

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return ""
    }
  }

  return (
    <div className={`flex items-start gap-3 px-4 py-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar Icon */}
      {!isUser ? (
        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/25 shrink-0 select-none">
          <Sparkles className="size-4 text-primary" />
        </div>
      ) : (
        <div className="size-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold shrink-0 select-none">
          U
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm border ${
            isUser
              ? isFailed
                ? "bg-destructive/10 text-destructive border-destructive"
                : "bg-primary text-primary-foreground border-primary/20 rounded-tr-none"
              : "bg-card text-foreground border-border/30 rounded-tl-none"
          } ${isSending ? "opacity-75" : ""}`}
        >
          {/* Plain Text Message Content */}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>

          {/* Extensible metadata alerts, e.g. errors */}
          {message.metadata?.error && (
            <p className="text-xs text-destructive mt-1.5 font-medium flex items-center gap-1">
              <AlertCircle className="size-3 shrink-0" />
              {message.metadata.error}
            </p>
          )}
        </div>

        {/* Timestamp & Status info */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-1 select-none">
          <span>{formatTime(message.createdAt)}</span>
          {isSending && <span className="animate-pulse">Sending...</span>}
          {isFailed && (
            <div className="flex items-center gap-1 text-destructive font-medium">
              <span>Failed</span>
              {onRetry && (
                <button
                  onClick={() => onRetry(message)}
                  className="hover:underline flex items-center gap-0.5 cursor-pointer text-primary"
                >
                  <RefreshCw className="size-2.5 animate-spin-reverse" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
