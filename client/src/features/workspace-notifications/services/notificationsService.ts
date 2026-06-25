import type { NotificationsService, Notification } from "../types"
import {
  getMockNotifications,
  getMockUnreadCount,
  markMockNotificationRead,
  markMockAllNotificationsRead,
} from "../mock/mockNotifications"

const USE_MOCK = true

export const notificationsService: NotificationsService = {
  getNotifications: async (workspaceId: string): Promise<Notification[]> => {
    if (USE_MOCK) {
      return getMockNotifications(workspaceId)
    }
    throw new Error("Live notifications service not integrated.")
  },

  getUnreadCount: async (workspaceId: string): Promise<number> => {
    if (USE_MOCK) {
      return getMockUnreadCount(workspaceId)
    }
    throw new Error("Live notifications service not integrated.")
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    if (USE_MOCK) {
      return markMockNotificationRead(notificationId)
    }
    throw new Error("Live notifications service not integrated.")
  },

  markAllNotificationsRead: async (workspaceId: string): Promise<void> => {
    if (USE_MOCK) {
      return markMockAllNotificationsRead(workspaceId)
    }
    throw new Error("Live notifications service not integrated.")
  },
}
