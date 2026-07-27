import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceChatService } from "../services/workspaceChatService"
import type { Message, SendMessagePayload, EditMessagePayload } from "../types"

export function useWorkspaceChannels(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-chat-channels", workspaceId],
    queryFn: async () => {
      try {
        const data = await workspaceChatService.getChannels(workspaceId)
        console.log("WorkspaceChat: getChannels response data:", data)
        return data
      } catch (err) {
        console.error("WorkspaceChat: getChannels error in queryFn:", err)
        throw err
      }
    },
    enabled: !!workspaceId,
  })
}

export function useWorkspaceMessages(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ["workspace-chat-messages", workspaceId, documentId],
    queryFn: async () => {
      try {
        const data = await workspaceChatService.getMessages(workspaceId, documentId)
        console.log("WorkspaceChat: getMessages response data:", data)
        queryClient.setQueryData(
          ["workspace-chat-messages-cursor", workspaceId, documentId],
          data.nextCursor
        )
        return data.messages
      } catch (err) {
        console.error("WorkspaceChat: getMessages error in queryFn:", err)
        throw err
      }
    },
    enabled: !!workspaceId && !!documentId,
    staleTime: 0,
  })
}

export function useLoadMoreMessages(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const cursor = queryClient.getQueryData<string | null>([
        "workspace-chat-messages-cursor",
        workspaceId,
        documentId,
      ])
      if (!cursor) return { messages: [], nextCursor: null }
      return workspaceChatService.getMessages(workspaceId, documentId, cursor)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["workspace-chat-messages-cursor", workspaceId, documentId],
        data.nextCursor
      )
      queryClient.setQueryData<Message[]>(
        ["workspace-chat-messages", workspaceId, documentId],
        (old = []) => {
          const newMsgs = data.messages.filter(
            (newMsg) => !old.some((oldMsg) => oldMsg.id === newMsg.id)
          )
          return [...newMsgs, ...old]
        }
      )
    },
  })
}

export function useSendMessage(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentId,
      payload,
    }: {
      documentId: string
      payload: SendMessagePayload
    }) => workspaceChatService.sendMessage(workspaceId, documentId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Message[]>(
        ["workspace-chat-messages", workspaceId, variables.documentId],
        (old = []) => {
          if (old.some((m) => m.id === data.id)) return old
          return [...old, data]
        }
      )
    },
  })
}

export function useEditMessage(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentId,
      messageId,
      payload,
    }: {
      documentId: string
      messageId: string
      payload: EditMessagePayload
    }) => workspaceChatService.editMessage(workspaceId, documentId, messageId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Message[]>(
        ["workspace-chat-messages", workspaceId, variables.documentId],
        (old = []) => old.map((m) => (m.id === data.id ? data : m))
      )
    },
  })
}

export function useDeleteMessage(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentId,
      messageId,
    }: {
      documentId: string
      messageId: string
    }) => workspaceChatService.deleteMessage(workspaceId, documentId, messageId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Message[]>(
        ["workspace-chat-messages", workspaceId, variables.documentId],
        (old = []) => old.filter((m) => m.id !== variables.messageId)
      )
    },
  })
}

export function usePinMessage(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentId,
      messageId,
    }: {
      documentId: string
      messageId: string
    }) => workspaceChatService.pinMessage(workspaceId, documentId, messageId),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Message[]>(
        ["workspace-chat-messages", workspaceId, variables.documentId],
        (old = []) =>
          old.map((m) =>
            m.id === variables.messageId
              ? {
                  ...m,
                  isPinned: true,
                  pinnedBy: data.pinnedBy,
                  pinnedAt: data.pinnedAt,
                }
              : m
          )
      )
    },
  })
}

export function useUnpinMessage(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentId,
      messageId,
    }: {
      documentId: string
      messageId: string
    }) => workspaceChatService.unpinMessage(workspaceId, documentId, messageId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<Message[]>(
        ["workspace-chat-messages", workspaceId, variables.documentId],
        (old = []) =>
          old.map((m) =>
            m.id === variables.messageId
              ? {
                  ...m,
                  isPinned: false,
                  pinnedBy: null,
                  pinnedAt: null,
                }
              : m
          )
      )
    },
  })
}

export function useToggleReaction(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      documentId,
      messageId,
      emoji,
    }: {
      documentId: string
      messageId: string
      emoji: string
    }) => workspaceChatService.toggleReaction(workspaceId, documentId, messageId, emoji),
    onSuccess: (data, variables) => {
      queryClient.setQueryData<Message[]>(
        ["workspace-chat-messages", workspaceId, variables.documentId],
        (old = []) =>
          old.map((m) =>
            m.id === variables.messageId
              ? {
                  ...m,
                  reactions: data,
                }
              : m
          )
      )
    },
  })
}