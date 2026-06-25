import type { Channel, Message, SendMessagePayload } from "../types"

const LATENCY = 500

const INITIAL_CHANNELS: Channel[] = [
  { id: "ch-general", name: "general", unreadCount: 0 },
  { id: "ch-development", name: "development", unreadCount: 2 },
  { id: "ch-design", name: "design", unreadCount: 0 },
  { id: "ch-announcements", name: "announcements", unreadCount: 1 },
]

const mockMessagesStore: Record<string, Message[]> = {
  "ch-general": [
    {
      id: "msg-g1",
      channelId: "ch-general",
      sender: "Alex Developer",
      avatar: "AD",
      timestamp: "10:32 AM",
      content: "Welcome to the workspace chat room! Feel free to coordinate tasks here.",
    },
    {
      id: "msg-g2",
      channelId: "ch-general",
      sender: "Jamie Product",
      avatar: "JP",
      timestamp: "10:34 AM",
      content: "Nice! This workspace shell feels very responsive.",
    },
    {
      id: "msg-g3",
      channelId: "ch-general",
      sender: "Taylor Support",
      avatar: "TS",
      timestamp: "10:35 AM",
      content: "Indeed, the nested routing is working perfectly.",
    },
  ],
  "ch-development": [
    {
      id: "msg-d1",
      channelId: "ch-development",
      sender: "Alex Developer",
      avatar: "AD",
      timestamp: "Yesterday, 4:10 PM",
      content: "Did anyone check the new Vite config?",
    },
    {
      id: "msg-d2",
      channelId: "ch-development",
      sender: "Sam Server",
      avatar: "SS",
      timestamp: "Yesterday, 4:12 PM",
      content: "Yes, I merged the build changes. Compilation runs in under 1 second now.",
    },
  ],
  "ch-design": [
    {
      id: "msg-ds1",
      channelId: "ch-design",
      sender: "Morgan Designer",
      avatar: "MD",
      timestamp: "2 days ago",
      content: "Here is the new palette draft for the workspace dashboards.",
    },
  ],
  "ch-announcements": [
    {
      id: "msg-a1",
      channelId: "ch-announcements",
      sender: "Jamie Product",
      avatar: "JP",
      timestamp: "Yesterday, 9:00 AM",
      content: "Sprint review is scheduled for tomorrow at 10 AM. See everyone there!",
    },
  ],
}

export async function getMockChannels(_workspaceId: string): Promise<Channel[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-chat-error") === "true") {
    throw new Error("Failed to load channels.")
  }

  if (localStorage.getItem("teamhub-mock-chat-empty") === "true") {
    return []
  }

  return INITIAL_CHANNELS
}

export async function getMockMessages(_workspaceId: string, channelId: string): Promise<Message[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-chat-error") === "true") {
    throw new Error("Failed to load messages.")
  }

  if (localStorage.getItem("teamhub-mock-chat-empty") === "true") {
    return []
  }

  return mockMessagesStore[channelId] || []
}

export async function sendMockMessage(_workspaceId: string, payload: SendMessagePayload): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 50)) // Simulated quick write

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    channelId: payload.channelId,
    sender: payload.sender,
    avatar: payload.avatar,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    content: payload.content,
  }

  if (!mockMessagesStore[payload.channelId]) {
    mockMessagesStore[payload.channelId] = []
  }

  mockMessagesStore[payload.channelId].push(newMessage)
  return newMessage
}
