import { useState } from "react"
import { Bell } from "lucide-react"
import {
  useWorkspaceNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/useNotifications"
import { NotificationPanel } from "./NotificationPanel"
import { toast } from "sonner"

interface NotificationBellProps {
  workspaceId: string
}

export function NotificationBell({ workspaceId }: NotificationBellProps) {
  const [panelOpen, setPanelOpen] = useState(false)

  // State preservation hooks (lifted up to the Bell component which stays mounted in the shell)
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [savedScrollTop, setSavedScrollTop] = useState(0)

  // Lightweight unread count query
  const {
    data: unreadCount = 0,
    refetch: refetchCount,
  } = useUnreadNotificationsCount(workspaceId)

  // Full notifications list query
  const {
    data: notifications = [],
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
  } = useWorkspaceNotifications(workspaceId)

  // Mutations
  const { mutate: markRead } = useMarkNotificationRead(workspaceId)
  const { mutate: markAllRead } = useMarkAllNotificationsRead(workspaceId)

  const handleMarkRead = (notificationId: string) => {
    markRead(notificationId, {
      onError: (err: any) => {
        toast.error(err.message || "Failed to update notification.")
      },
    })
  }

  const handleMarkAllRead = () => {
    markAllRead(undefined, {
      onSuccess: () => {
        toast.success("All notifications marked as read")
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to update notifications.")
      },
    })
  }

  const handleRetry = () => {
    refetchCount()
    refetchList()
  }

  return (
    <>
      {/* Notifications Button */}
      <button
        onClick={() => setPanelOpen(true)}
        className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        title="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 bg-destructive rounded-full" />
        )}
      </button>

      {/* Notifications slide-over panel */}
      <NotificationPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isListLoading}
        error={listError}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        onRetry={handleRetry}
        filter={filter}
        onFilterChange={setFilter}
        savedScrollTop={savedScrollTop}
        onScrollChange={setSavedScrollTop}
      />
    </>
  )
}
