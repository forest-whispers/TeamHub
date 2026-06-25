import { AlertCircle, Inbox } from "lucide-react"
import { NotificationItem } from "./NotificationItem"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import type { Notification } from "../types"

interface NotificationListProps {
  isLoading: boolean
  error: any
  notifications: Notification[]
  onReadItem: (id: string) => void
  onClickItem?: (notification: Notification) => void
  onRetry?: () => void
}

export function NotificationList({
  isLoading,
  error,
  notifications,
  onReadItem,
  onClickItem,
  onRetry,
}: NotificationListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto select-none">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex gap-3 items-start py-1">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="space-y-2.5 min-w-0 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-2.5 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 select-none">
        <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-full">
          <AlertCircle className="size-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-xs text-foreground">Failed to load notifications</h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            There was an error retrieving your workspace notifications list.
          </p>
        </div>
        {onRetry && (
          <Button size="xs" variant="outline" onClick={onRetry} className="cursor-pointer">
            Retry
          </Button>
        )}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3.5 select-none">
        <div className="p-4 bg-muted/30 border border-border/40 rounded-full text-muted-foreground/60">
          <Inbox className="size-8" />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h4 className="font-bold text-xs text-foreground">All caught up!</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            You don't have any notifications under this filter at the moment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border/20">
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onRead={onReadItem}
          onClick={onClickItem}
        />
      ))}
    </div>
  )
}
