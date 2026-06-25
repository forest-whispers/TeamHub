export interface Notification {
  id: string
  type:
    | "document_updated"
    | "document_shared"
    | "member_joined"
    | "member_invited"
    | "mention"
    | "comment"
    | "workspace_activity"
    | "system"
  title: string
  description: string
  createdAt: string
  isRead: boolean
  actor?: {
    name: string
    avatarUrl?: string
  }
  metadata?: Record<string, any>
}

export interface NotificationsService {
  getNotifications(workspaceId: string): Promise<Notification[]>
  getUnreadCount(workspaceId: string): Promise<number>
  markNotificationRead(notificationId: string): Promise<void>
  markAllNotificationsRead(workspaceId: string): Promise<void>
}
