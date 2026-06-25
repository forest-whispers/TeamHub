export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  status?: "sending" | "sent" | "failed"
  metadata?: {
    error?: string
    attachments?: string[]
    citations?: string[]
    [key: string]: any
  }
}

export interface ConversationMetadata {
  id: string
  title: string
  createdAt: string
  lastMessagePreview?: string
  metadata?: {
    workspaceId?: string
    modelIdentifier?: string
    pinned?: boolean
    archived?: boolean
    [key: string]: any
  }
}

export interface ConversationDetail {
  id: string
  messages: Message[]
}

export interface AIService {
  getConversations(workspaceId: string): Promise<ConversationMetadata[]>
  getConversation(workspaceId: string, conversationId: string): Promise<ConversationDetail>
  createConversation(workspaceId: string, title?: string): Promise<ConversationMetadata>
  sendMessage(workspaceId: string, conversationId: string, content: string): Promise<ConversationDetail>
}
