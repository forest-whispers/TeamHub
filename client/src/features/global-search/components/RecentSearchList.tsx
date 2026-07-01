import { Command } from "cmdk"
import { Clock, Trash2 } from "lucide-react"

interface RecentSearchListProps {
  items: string[]
  onSelect: (query: string) => void
  onClear: () => void
}

export function RecentSearchList({ items, onSelect, onClear }: RecentSearchListProps) {
  if (items.length === 0) return null

  return (
    <Command.Group
      heading={
        <div className="flex items-center justify-between w-full pr-1">
          <span>Recent Searches</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClear()
            }}
            className="flex items-center text-muted-foreground hover:text-destructive text-[10px] font-semibold cursor-pointer gap-1 transition-colors"
            title="Clear history"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>
      }
      className="overflow-hidden p-1 text-xs font-medium text-muted-foreground"
    >
      {items.map((query) => (
        <Command.Item
          key={query}
          value={`recent-${query}`}
          onSelect={() => onSelect(query)}
          className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm font-normal text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
        >
          <Clock className="mr-2.5 h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span className="flex-1 truncate">{query}</span>
        </Command.Item>
      ))}
    </Command.Group>
  )
}