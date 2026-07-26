import type { Channel, Message, SendMessagePayload } from "../types"

export const workspaceChatService = {
  getChannels: async (workspaceId: string): Promise<Channel[]> => {
    return []
  },
  getMessages: async (workspaceId: string, channelId: string): Promise<Message[]> => {
    return []
  },
  sendMessage: async (workspaceId: string, payload: SendMessagePayload): Promise<Message> => {
    return null;
  },
}