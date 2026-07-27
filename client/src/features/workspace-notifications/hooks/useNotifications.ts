import { useInfiniteQuery, useMutation, useQueryClient, } from "@tanstack/react-query"
import type { InfiniteData } from "@tanstack/react-query"
import { useEffect } from "react"
import { notificationsService } from "../services/notificationsService"
import { socket } from "@/shared/lib/socket"
import type { Notification, NotificationsResponse } from "../types"

// Key convention matching
const queryKey = ["workspace-notifications"]

export function useNotifications(enabled: boolean) {
  return useInfiniteQuery<NotificationsResponse, Error, InfiniteData<NotificationsResponse>>({
    queryKey,
    queryFn: ({ pageParam }) => notificationsService.getNotifications(pageParam as string | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationsService.markNotificationRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Update local query cache directly
      queryClient.setQueryData<InfiniteData<NotificationsResponse>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          })),
        }
      })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsService.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.setQueryData<InfiniteData<NotificationsResponse>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) => ({ ...n, isRead: true })),
          })),
        }
      })
    },
  })
}

export function useNotificationRealtime(workspaceId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!workspaceId) return

    // Join notification socket room
    socket.emit("notification:join", {}, (response: any) => {
      if (response && !response.success) {
        console.error("Failed to join notification room:", response.message)
      }
    })

    const handleNewNotification = (notification: Notification) => {
      queryClient.setQueryData<InfiniteData<NotificationsResponse>>(queryKey, (old) => {
        if (!old) return old
        
        // Avoid duplicate additions
        const exists = old.pages.some((page) =>
          page.notifications.some((n) => n.id === notification.id)
        )
        if (exists) return old

        const updatedPages = [...old.pages]
        if (updatedPages.length === 0) {
          updatedPages.push({
            notifications: [notification],
            nextCursor: null,
            hasMore: false,
          })
        } else {
          updatedPages[0] = {
            ...updatedPages[0],
            notifications: [notification, ...updatedPages[0].notifications],
          }
        }

        return {
          ...old,
          pages: updatedPages,
        }
      })
    }

    const handleNotificationRead = (notificationId: string) => {
      queryClient.setQueryData<InfiniteData<NotificationsResponse>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            ),
          })),
        }
      })
    }

    const handleNotificationReadAll = () => {
      queryClient.setQueryData<InfiniteData<NotificationsResponse>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) => ({ ...n, isRead: true })),
          })),
        }
      })
    }

    socket.on("notification:new", handleNewNotification)
    socket.on("notification:read", handleNotificationRead)
    socket.on("notification:read-all", handleNotificationReadAll)

    return () => {
      socket.emit("notification:leave", {}, (response: any) => {
        if (response && !response.success) {
          console.error("Failed to leave notification room:", response.message)
        }
      })

      socket.off("notification:new", handleNewNotification)
      socket.off("notification:read", handleNotificationRead)
      socket.off("notification:read-all", handleNotificationReadAll)
    }
  }, [workspaceId, queryClient])
}