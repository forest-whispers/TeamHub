import type { Notification } from "../types"

const LATENCY = 500

const MOCK_NOTIFICATIONS: Record<string, Notification[]> = {
  "ws-1": [
    {
      id: "notif-1",
      type: "document_updated",
      title: "API Architecture Guidelines updated",
      description: "Alex Developer made edits to the API guidelines.",
      createdAt: "10 mins ago",
      isRead: false,
      actor: { name: "Alex Developer" },
      metadata: { documentId: "doc-1" },
    },
    {
      id: "notif-2",
      type: "mention",
      title: "Morgan Designer mentioned you",
      description: "Morgan tagged you in 'Database Schema Draft' comments: '@you please review the profile section design.'",
      createdAt: "1 hour ago",
      isRead: false,
      actor: { name: "Morgan Designer" },
      metadata: { documentId: "doc-2" },
    },
    {
      id: "notif-3",
      type: "member_joined",
      title: "Casey Coder joined the workspace",
      description: "Casey Coder has been added as a Frontend Engineer.",
      createdAt: "1 day ago",
      isRead: true,
      actor: { name: "Casey Coder" },
    },
    {
      id: "notif-4",
      type: "comment",
      title: "New comment on Release Checklist v1.2",
      description: "Jamie Product: 'Is the release scheduled for this Thursday?'",
      createdAt: "2 days ago",
      isRead: true,
      actor: { name: "Jamie Product" },
      metadata: { documentId: "doc-3" },
    },
  ],
  "ws-2": [
    {
      id: "notif-5",
      type: "document_shared",
      title: "Marketing Strategy 2026 shared",
      description: "Jamie Product shared a new marketing roadmap document with you.",
      createdAt: "3 hours ago",
      isRead: false,
      actor: { name: "Jamie Product" },
      metadata: { documentId: "doc-4" },
    },
    {
      id: "notif-6",
      type: "system",
      title: "Workspace Storage is at 80%",
      description: "Your workspace has consumed 8.2 GB of 10 GB limit.",
      createdAt: "Yesterday",
      isRead: false,
    },
  ],
}

export async function getMockNotifications(workspaceId: string): Promise<Notification[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-notifications-empty") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-notifications-error") === "true") {
    throw new Error("Failed to load notifications.")
  }

  const notifs = MOCK_NOTIFICATIONS[workspaceId] || MOCK_NOTIFICATIONS["ws-1"]
  return notifs.map((n) => ({ ...n }))
}

export async function getMockUnreadCount(workspaceId: string): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (localStorage.getItem("teamhub-mock-notifications-empty") === "true") {
    return 0
  }

  if (localStorage.getItem("teamhub-mock-notifications-error") === "true") {
    throw new Error("Failed to load unread count.")
  }

  const notifs = MOCK_NOTIFICATIONS[workspaceId] || MOCK_NOTIFICATIONS["ws-1"]
  return notifs.filter((n) => !n.isRead).length
}

export async function markMockNotificationRead(notificationId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (localStorage.getItem("teamhub-mock-notifications-error") === "true") {
    throw new Error("Failed to update notification status.")
  }

  for (const workspaceId in MOCK_NOTIFICATIONS) {
    const notif = MOCK_NOTIFICATIONS[workspaceId].find((n) => n.id === notificationId)
    if (notif) {
      notif.isRead = true
      return
    }
  }
  throw new Error("Notification not found.")
}

export async function markMockAllNotificationsRead(workspaceId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 350))

  if (localStorage.getItem("teamhub-mock-notifications-error") === "true") {
    throw new Error("Failed to mark all notifications as read.")
  }

  const notifs = MOCK_NOTIFICATIONS[workspaceId] || MOCK_NOTIFICATIONS["ws-1"]
  notifs.forEach((n) => {
    n.isRead = true
  })
}
