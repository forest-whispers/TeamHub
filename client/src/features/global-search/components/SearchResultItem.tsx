import { Command } from "cmdk"
import { FileText, User, Folder, Settings, Terminal } from "lucide-react"
import type { SearchResult } from "../types"

interface SearchResultItemProps {
  result: SearchResult
  onSelect: (result: SearchResult) => void
}

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const getIcon = () => {
    switch (result.type) {
      case "document":
        return <FileText className="mr-2.5 h-4.5 w-4.5 text-blue-500 shrink-0" />
      case "member":
        return <User className="mr-2.5 h-4.5 w-4.5 text-emerald-500 shrink-0" />
      case "workspace":
        return <Folder className="mr-2.5 h-4.5 w-4.5 text-indigo-500 shrink-0" />
      case "setting":
        return <Settings className="mr-2.5 h-4.5 w-4.5 text-orange-500 shrink-0" />
      case "command":
        return <Terminal className="mr-2.5 h-4.5 w-4.5 text-purple-500 shrink-0" />
      default:
        return <FileText className="mr-2.5 h-4.5 w-4.5 text-muted-foreground shrink-0" />
    }
  }

  return (
    <Command.Item
      value={result.id}
      onSelect={() => onSelect(result)}
      className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
    >
      {getIcon()}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-medium text-foreground truncate">{result.title}</span>
        <span className="text-xs text-muted-foreground truncate">{result.subtitle}</span>
      </div>
      {result.category && (
        <span className="ml-2 rounded bg-muted/65 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
          {result.category}
        </span>
      )}
    </Command.Item>
  )
}