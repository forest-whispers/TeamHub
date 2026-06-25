import {
  FileText,
  UserPlus,
  Users,
  MessageSquare,
  AtSign,
  Bell,
  Check,
} from "lucide-react"
import type { Notification } from "../types"
import { Button } from "@/shared/components/ui/button"

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onClick?: (notification: Notification) => void
}

export function NotificationItem({
  notification,
  onRead,
  onClick,
}: NotificationItemProps) {
  // Determine icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "document_updated":
      case "document_shared":
        return <FileText className="size-4 text-indigo-500" />
      case "member_invited":
        return <UserPlus className="size-4 text-sky-500" />
      case "member_joined":
        return <Users className="size-4 text-emerald-500" />
      case "mention":
        return <AtSign className="size-4 text-violet-500" />
      case "comment":
        return <MessageSquare className="size-4 text-amber-500" />
      default:
        return <Bell className="size-4 text-muted-foreground" />
    }
  }

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={`group flex items-start gap-3 p-3.5 border-b border-border/40 transition-all select-none relative ${
        notification.isRead
          ? "bg-background hover:bg-muted/30"
          : "bg-primary/[0.03] hover:bg-primary/[0.06] border-l-2 border-l-primary"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Type Icon Container */}
      <div className={`p-2 rounded-full shrink-0 border select-none ${
        notification.isRead
          ? "bg-muted/40 border-border/40 text-muted-foreground"
          : "bg-background border-primary/10"
      }`}>
        {getIcon()}
      </div>

      {/* Title & Description */}
      <div className="min-w-0 flex-1 space-y-1 text-left">
        <div className="flex items-start justify-between gap-1.5 pr-6">
          <p className={`text-xs font-semibold leading-tight ${
            notification.isRead ? "text-foreground/80" : "text-foreground font-bold"
          }`}>
            {notification.title}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed select-text">
          {notification.description}
        </p>
        <span className="text-[10px] text-muted-foreground/80 font-medium block pt-0.5">
          {notification.createdAt}
        </span>
      </div>

      {/* Action Checkbox overlay */}
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation()
            onRead(notification.id)
          }}
          className="absolute top-3.5 right-3 shadow-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100 transition-opacity cursor-pointer border border-border/50 bg-background hover:bg-muted"
          title="Mark as Read"
        >
          <Check className="size-3 text-foreground" />
        </Button>
      )}
    </div>
  )
}
