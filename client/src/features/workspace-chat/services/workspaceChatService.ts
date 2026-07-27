import api from "@/shared/lib/api"
import type { Channel, Message, SendMessagePayload, EditMessagePayload } from "../types"

export const workspaceChatService = {
  getChannels: async (workspaceId: string): Promise<Channel[]> => {
    const { data } = await api.get(`/workspaces/${workspaceId}/documents`)
    return data.map((doc: any) => ({
      id: doc.id,
      name: doc.title || "Untitled Document",
      unreadCount: 0,
    }))
  },

  getMessages: async (
    workspaceId: string,
    documentId: string,
    cursor?: string
  ): Promise<{ messages: Message[]; nextCursor: string | null }> => {
    const params: Record<string, any> = { limit: 30 }
    if (cursor) {
      params.cursor = cursor
    }
    const { data } = await api.get(`/workspaces/${workspaceId}/documents/${documentId}/chat`, {
      params,
    })
    return data
  },

  sendMessage: async (
    workspaceId: string,
    documentId: string,
    payload: SendMessagePayload
  ): Promise<Message> => {
    const { data } = await api.post(`/workspaces/${workspaceId}/documents/${documentId}/chat`, payload)
    return data
  },

  editMessage: async (
    workspaceId: string,
    documentId: string,
    messageId: string,
    payload: EditMessagePayload
  ): Promise<Message> => {
    const { data } = await api.patch(
      `/workspaces/${workspaceId}/documents/${documentId}/chat/${messageId}`,
      payload
    )
    return data
  },

  deleteMessage: async (
    workspaceId: string,
    documentId: string,
    messageId: string
  ): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/documents/${documentId}/chat/${messageId}`)
  },

  pinMessage: async (
    workspaceId: string,
    documentId: string,
    messageId: string
  ): Promise<any> => {
    const { data } = await api.patch(
      `/workspaces/${workspaceId}/documents/${documentId}/chat/${messageId}/pin`
    )
    return data
  },

  unpinMessage: async (
    workspaceId: string,
    documentId: string,
    messageId: string
  ): Promise<any> => {
    const { data } = await api.delete(
      `/workspaces/${workspaceId}/documents/${documentId}/chat/${messageId}/pin`
    )
    return data
  },

  toggleReaction: async (
    workspaceId: string,
    documentId: string,
    messageId: string,
    emoji: string
  ): Promise<any> => {
    const { data } = await api.post(
      `/workspaces/${workspaceId}/documents/${documentId}/chat/${messageId}/reaction`,
      { emoji }
    )
    return data
  },
}