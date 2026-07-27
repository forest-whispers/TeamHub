import api from "@/shared/lib/api"
import type { NotificationsService, Notification, NotificationsResponse } from "../types"

export const notificationsService: NotificationsService = {
  getNotifications: async (cursor?: string, limit = 20): Promise<NotificationsResponse> => {
    const { data } = await api.get("/notifications", {
      params: { cursor, limit }
    })
    return data.data
  },

  markNotificationRead: async (notificationId: string): Promise<Notification> => {
    const { data } = await api.patch(`/notifications/${notificationId}/read`)
    return data.data
  },

  markAllNotificationsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all")
  },
}