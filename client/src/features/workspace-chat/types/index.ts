export interface Channel {
  id: string
  name: string
  unreadCount: number
}

export interface Message {
  id: string
  channelId: string
  sender: string
  avatar: string
  timestamp: string
  content: string
}

export interface SendMessagePayload {
  channelId: string
  sender: string
  avatar: string
  content: string
}
