export interface Channel {
  id: string
  name: string
  unreadCount: number
}

export interface UserSummary {
  id: string
  name: string
  avatar: string | null
}

export interface ReactionSummary {
  id: string
  emoji: string
  userId: string
}

export interface ReplyToSummary {
  id: string
  content: string
  sender: UserSummary
}

export interface Message {
  id: string
  content: string
  isEdited: boolean
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
  sender: UserSummary
  replyTo?: ReplyToSummary | null
  isPinned: boolean
  pinnedBy?: UserSummary | null
  pinnedAt?: string | null
  reactions?: ReactionSummary[]
  workspaceId: string
  documentId: string
  replyToId?: string | null
}

export interface SendMessagePayload {
  content: string
  replyToId?: string
  mentionedUserIds?: string[]
}

export interface EditMessagePayload {
  content: string
  mentionedUserIds?: string[]
}