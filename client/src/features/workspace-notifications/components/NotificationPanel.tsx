import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Dialog, DialogPortal, DialogOverlay } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { X, Check } from "lucide-react"
import { NotificationList } from "./NotificationList"
import type { Notification } from "../types"

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: any
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onRetry?: () => void
  // State preservation props
  filter: "all" | "unread"
  onFilterChange: (filter: "all" | "unread") => void
  savedScrollTop: number
  onScrollChange: (scrollTop: number) => void
}

export function NotificationPanel({
  open,
  onOpenChange,
  notifications,
  unreadCount,
  isLoading,
  error,
  onMarkRead,
  onMarkAllRead,
  onRetry,
  filter,
  onFilterChange,
  savedScrollTop,
  onScrollChange,
}: NotificationPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Restore scroll position when panel opens or when filter changes
  React.useEffect(() => {
    if (open && scrollRef.current) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = savedScrollTop
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open, filter, savedScrollTop])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScrollChange(e.currentTarget.scrollTop)
  }

  // Filter the list of notifications based on tab state
  const displayedNotifications = React.useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead)
    }
    return notifications
  }, [notifications, filter])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full sm:max-w-md h-full bg-popover shadow-2xl border-l border-border outline-none transition-all duration-300 animate-in slide-in-from-right select-none">
          {/* Header section */}
          <div className="p-4 border-b border-border/40 flex flex-col gap-3.5 shrink-0 select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5 min-w-[20px] text-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Close controls */}
              <DialogPrimitive.Close asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-sm opacity-75 hover:opacity-100 cursor-pointer"
                >
                  <X className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogPrimitive.Close>
            </div>

            {/* Sub-Header Actions & Filters */}
            <div className="flex items-center justify-between gap-4">
              {/* Filter Tabs */}
              <div className="flex items-center bg-muted/65 p-0.5 rounded-lg border border-border/30">
                <button
                  onClick={() => onFilterChange("all")}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filter === "all"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => onFilterChange("unread")}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    filter === "unread"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Unread
                </button>
              </div>

              {/* Mark all read button */}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={onMarkAllRead}
                  className="text-[10px] font-semibold h-7 text-primary hover:text-primary/90 border border-transparent hover:border-border cursor-pointer px-2"
                >
                  <Check className="size-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* List Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto flex flex-col"
          >
            <NotificationList
              isLoading={isLoading}
              error={error}
              notifications={displayedNotifications}
              onReadItem={onMarkRead}
              onRetry={onRetry}
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
