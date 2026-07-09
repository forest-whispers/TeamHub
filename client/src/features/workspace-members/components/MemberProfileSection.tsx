import { Mail, Shield, Crown } from "lucide-react"

interface MemberProfileSectionProps {
  name: string
  email: string
  role: string
  status?: "online" | "away" | "offline"
  lastActive?: string
}

export function MemberProfileSection({
  name,
  email,
  role,
  status,
  lastActive,
}: MemberProfileSectionProps) {
  // Avatar initials helper
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Consistent background colors based on name hash
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

  // Format status text
  const getStatusText = () => {
    switch (status) {
      case "online":
        return "🟢 Online"
      case "away":
        return `🟡 Away • Last seen ${lastActive}`
      case "offline":
        return `⚫ Offline • Last seen ${lastActive}`
      default:
        return `⚫ Offline`
    }
  }

  return (
    <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-border/40 select-none">
      {/* Large Initials Avatar */}
      <div className={`size-16 rounded-full flex items-center justify-center font-bold text-lg border ${getAvatarBgColor(name)}`}>
        {getInitials(name)}
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-base text-foreground leading-tight flex items-center justify-center gap-1.5">
          <span>{name}</span>
          {role === "OWNER" && (
            <Crown className="size-4 text-amber-500 fill-amber-500 shrink-0" />
          )}
        </h3>

        {/* Email row */}
        <span className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground truncate">
          <Mail className="size-3.5 shrink-0 text-muted-foreground/80" />
          <span>{email}</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-center pt-1.5">
        {/* Status text */}
        {status && (
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted/60 border border-border/30 rounded-full px-2.5 py-0.5 leading-none">
            {getStatusText()}
          </span>
        )}

        {/* Role badge */}
        <div className="flex items-center gap-1">
          <Shield className="size-3 text-primary/75 shrink-0" />
          <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5 leading-none uppercase">
            {role}
          </span>
        </div>
      </div>
    </div>
  )
}