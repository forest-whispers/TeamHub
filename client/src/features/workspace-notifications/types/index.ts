export interface Notification {
  id: string
  type:
    | "CHAT_MENTION"
    | "DISCUSSION_MENTION"
    | "DISCUSSION_REPLY"
    | "DISCUSSION_RESOLVED"
    | "WORKSPACE_ROLE_CHANGED"
    | "WORKSPACE_REMOVED"
  title: string
  description: string
  createdAt: string
  isRead: boolean
  actor?: {
    name: string
    avatarUrl?: string | null
  }
  metadata?: Record<string, any>
}

export interface NotificationsResponse {
  notifications: Notification[]
  nextCursor: string | null
  hasMore: boolean
}

export interface NotificationsService {
  getNotifications(cursor?: string, limit?: number): Promise<NotificationsResponse>
  markNotificationRead(notificationId: string): Promise<Notification>
  markAllNotificationsRead(): Promise<void>
}