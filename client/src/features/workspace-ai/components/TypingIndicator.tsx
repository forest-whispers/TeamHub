import { Sparkles } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 select-none">
      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/25 shrink-0">
        <Sparkles className="size-4 text-primary animate-pulse" />
      </div>
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div className="bg-muted/70 text-muted-foreground px-4 py-2.5 rounded-2xl rounded-tl-none border border-border/30 shadow-sm flex items-center gap-1 min-h-[38px] justify-center">
          <span
            className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  )
}
