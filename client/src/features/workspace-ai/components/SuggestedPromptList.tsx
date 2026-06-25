import { Sparkles } from "lucide-react"

interface SuggestedPromptListProps {
  onSelect: (prompt: string) => void
}

const SUGGESTIONS = [
  "Summarize this workspace",
  "Explain this document",
  "Find recently edited documents",
  "Show active members",
  "What changed today?",
]

export function SuggestedPromptList({ onSelect }: SuggestedPromptListProps) {
  return (
    <div className="p-6 space-y-3 flex flex-col justify-center items-center flex-1 max-w-[360px] mx-auto select-none">
      <div className="flex items-center gap-2 mb-1.5 text-sm font-semibold text-primary">
        <Sparkles className="size-4 animate-pulse" />
        <span>Ask Workspace AI</span>
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-[280px] mb-4 leading-relaxed">
        Select a template prompt below or compose a custom message.
      </p>
      <div className="space-y-2.5 w-full">
        {SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelect(prompt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground text-xs font-medium text-foreground transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98] truncate"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
