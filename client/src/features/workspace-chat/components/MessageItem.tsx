import type { Message } from "../types"

interface MessageItemProps {
  message: Message
  currentUserName?: string
}

export function MessageItem({ message, currentUserName }: MessageItemProps) {
  const isSelf = Boolean(currentUserName && message.sender.toLowerCase() === currentUserName.toLowerCase())

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

  if (isSelf) {
    return (
      <div className="flex flex-row-reverse gap-2.5 text-right items-start py-1.5 select-text group justify-start">
        {/* Avatar */}
        <div
          className={`size-7 rounded-full flex items-center justify-center font-bold text-[10px] border shrink-0 select-none ${getAvatarBgColor(
            message.sender
          )}`}
        >
          {message.avatar}
        </div>

        {/* Message Info and Content */}
        <div className="min-w-0 max-w-[75%] space-y-1 flex flex-col items-end">
          <div className="flex items-baseline gap-2 flex-row-reverse text-right">
            <span className="font-semibold text-xs text-foreground truncate select-none">
              {message.sender} (You)
            </span>
            <span className="text-[10px] text-muted-foreground select-none">
              {message.timestamp}
            </span>
          </div>
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-xs text-xs leading-relaxed whitespace-pre-wrap text-left shadow-xs">
            {message.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 text-left items-start py-1.5 select-text group">
      {/* Avatar */}
      <div
        className={`size-7 rounded-full flex items-center justify-center font-bold text-[10px] border shrink-0 select-none ${getAvatarBgColor(
          message.sender
        )}`}
      >
        {message.avatar}
      </div>

      {/* Message Info and Content */}
      <div className="min-w-0 max-w-[75%] space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-xs text-foreground truncate select-none">
            {message.sender}
          </span>
          <span className="text-[10px] text-muted-foreground select-none">
            {message.timestamp}
          </span>
        </div>
        <div className="bg-muted/60 text-foreground border border-border/40 p-3 rounded-2xl rounded-tl-xs text-xs leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  )
}