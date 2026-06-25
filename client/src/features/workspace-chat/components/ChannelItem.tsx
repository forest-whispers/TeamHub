import { Hash } from "lucide-react"
import type { Channel } from "../types"

interface ChannelItemProps {
  channel: Channel
  isSelected: boolean
  onClick: () => void
}

export function ChannelItem({ channel, isSelected, onClick }: ChannelItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer select-none text-left ${
        isSelected
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2 truncate">
        <Hash className={`size-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground/60"}`} />
        <span className="truncate">{channel.name}</span>
      </div>
      {channel.unreadCount > 0 && (
        <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0 min-w-5 text-center">
          {channel.unreadCount}
        </span>
      )}
    </button>
  )
}
