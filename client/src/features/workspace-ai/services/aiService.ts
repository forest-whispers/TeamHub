import type { AIService, ConversationMetadata, ConversationDetail } from "../types"
import {
  getMockConversations,
  getMockConversation,
  createMockConversation,
  mockSendMessage,
} from "../mock/mockAI"

const USE_MOCK = true

export const aiService: AIService = {
  getConversations: async (workspaceId: string): Promise<ConversationMetadata[]> => {
    if (USE_MOCK) {
      return getMockConversations(workspaceId)
    }
    throw new Error("Live AI service not integrated.")
  },

  getConversation: async (workspaceId: string, conversationId: string): Promise<ConversationDetail> => {
    if (USE_MOCK) {
      return getMockConversation(workspaceId, conversationId)
    }
    throw new Error("Live AI service not integrated.")
  },

  createConversation: async (workspaceId: string, title?: string): Promise<ConversationMetadata> => {
    if (USE_MOCK) {
      return createMockConversation(workspaceId, title)
    }
    throw new Error("Live AI service not integrated.")
  },

  sendMessage: async (
    workspaceId: string,
    conversationId: string,
    content: string
  ): Promise<ConversationDetail> => {
    if (USE_MOCK) {
      return mockSendMessage(workspaceId, conversationId, content)
    }
    throw new Error("Live AI service not integrated.")
  },
}
