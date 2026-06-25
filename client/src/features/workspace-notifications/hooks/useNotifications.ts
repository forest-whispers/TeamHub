import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { notificationsService } from "../services/notificationsService"
import type { Notification } from "../types"

export function useWorkspaceNotifications(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-notifications", workspaceId],
    queryFn: () => notificationsService.getNotifications(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 30, // 30 seconds cache for notifications list
  })
}

export function useUnreadNotificationsCount(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-notifications-unread-count", workspaceId],
    queryFn: () => notificationsService.getUnreadCount(workspaceId),
    enabled: !!workspaceId,
    staleTime: 1000 * 60, // 1 minute cache for unread count
  })
}

export function useMarkNotificationRead(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markNotificationRead(notificationId),
    onSuccess: (_, notificationId) => {
      let wasUnread = false

      // 1. Update full list cache
      queryClient.setQueryData<Notification[]>(
        ["workspace-notifications", workspaceId],
        (old) => {
          if (!old) return []
          return old.map((notif) => {
            if (notif.id === notificationId && !notif.isRead) {
              wasUnread = true
              return { ...notif, isRead: true }
            }
            return notif
          })
        }
      )

      // 2. Decrement count only if the item was actually unread
      if (wasUnread) {
        queryClient.setQueryData<number>(
          ["workspace-notifications-unread-count", workspaceId],
          (oldCount) => {
            if (oldCount === undefined) return 0
            return Math.max(0, oldCount - 1)
          }
        )
      }
    },
  })
}

export function useMarkAllNotificationsRead(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      notificationsService.markAllNotificationsRead(workspaceId),
    onSuccess: () => {
      // 1. Update full list cache
      queryClient.setQueryData<Notification[]>(
        ["workspace-notifications", workspaceId],
        (old) => {
          if (!old) return []
          return old.map((notif) => ({ ...notif, isRead: true }))
        }
      )

      // 2. Reset count cache to 0
      queryClient.setQueryData<number>(
        ["workspace-notifications-unread-count", workspaceId],
        0
      )
    },
  })
}
