import { getMockChannels, getMockMessages, sendMockMessage } from "../mock/mockWorkspaceChat"
import type { Channel, Message, SendMessagePayload } from "../types"

export const workspaceChatService = {
  getChannels: async (workspaceId: string): Promise<Channel[]> => {
    return getMockChannels(workspaceId)
  },
  getMessages: async (workspaceId: string, channelId: string): Promise<Message[]> => {
    return getMockMessages(workspaceId, channelId)
  },
  sendMessage: async (workspaceId: string, payload: SendMessagePayload): Promise<Message> => {
    return sendMockMessage(workspaceId, payload)
  },
}
