import { useState } from "react"
import { Bell } from "lucide-react"
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useNotificationRealtime,
} from "../hooks/useNotifications"
import { NotificationPanel } from "./NotificationPanel"
import { toast } from "sonner"

interface NotificationBellProps {
  workspaceId: string
}

export function NotificationBell({ workspaceId }: NotificationBellProps) {
  const [panelOpen, setPanelOpen] = useState(false)

  // State preservation hooks
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [savedScrollTop, setSavedScrollTop] = useState(0)

  // Realtime updates
  useNotificationRealtime(workspaceId)

  // Infinite query for notifications list
  const {
    data,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications(panelOpen)

  // Flatten the paginated list of notifications
  const notifications = data?.pages.flatMap((page) => page.notifications) || []

  // Compute unread count from the cached notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Mutations
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAllRead } = useMarkAllNotificationsRead()

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
    refetchList()
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
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
        onLoadMore={handleLoadMore}
      />
    </>
  )
}