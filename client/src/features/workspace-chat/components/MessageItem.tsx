import type { Message } from "../types"

interface MessageItemProps {
  message: Message
}

export function MessageItem({ message }: MessageItemProps) {
  const getAvatarBgColor = (name: string) => {
    const colors = [
      "bg-red-500/10 text-red-500 border-red-500/20",
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "bg-green-500/10 text-green-500 border-green-500/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-teal-500/10 text-teal-500 border-teal-500/20",
      "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      "bg-sky-500/10 text-sky-500 border-sky-500/20",
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "bg-violet-500/10 text-violet-500 border-violet-500/20",
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
      "bg-pink-500/10 text-pink-500 border-pink-500/20",
      "bg-rose-500/10 text-rose-500 border-rose-500/20",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  return (
    <div className="flex gap-3 text-left items-start py-2 select-text group">
      {/* Avatar */}
      <div
        className={`size-8 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 select-none ${getAvatarBgColor(
          message.sender
        )}`}
      >
        {message.avatar}
      </div>

      {/* Message Info and Content */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-xs text-foreground truncate select-none">
            {message.sender}
          </span>
          <span className="text-[10px] text-muted-foreground select-none">
            {message.timestamp}
          </span>
        </div>
        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  )
}
