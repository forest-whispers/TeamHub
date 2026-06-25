import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { aiService } from "../services/aiService"
import type { ConversationMetadata, ConversationDetail, Message } from "../types"

/**
 * Hook to retrieve the list of conversations in a workspace.
 */
export function useWorkspaceAIConversations(workspaceId: string) {
  return useQuery<ConversationMetadata[]>({
    queryKey: ["workspace-ai-conversations", workspaceId],
    queryFn: () => aiService.getConversations(workspaceId),
    enabled: !!workspaceId,
  })
}

/**
 * Hook to retrieve a specific conversation detail, reconciling server messages
 * with any pending optimistic local messages (status: "sending" | "failed").
 */
export function useAIConversation(workspaceId: string, conversationId: string) {
  const queryClient = useQueryClient()

  return useQuery<ConversationDetail>({
    queryKey: ["workspace-ai-conversation", workspaceId, conversationId],
    queryFn: async () => {
      const serverDetail = await aiService.getConversation(workspaceId, conversationId)

      // Get the current cached detail state
      const cachedDetail = queryClient.getQueryData<ConversationDetail>([
        "workspace-ai-conversation",
        workspaceId,
        conversationId,
      ])
      if (!cachedDetail) return serverDetail

      // Filter out messages that are in sending or failed status
      const optimisticMessages = cachedDetail.messages.filter(
        (m) => m.status === "sending" || m.status === "failed"
      )
      if (optimisticMessages.length === 0) return serverDetail

      // Reconcile: append pending messages not yet present on the server
      const serverContents = new Set(serverDetail.messages.map((m) => m.content))
      const pendingMessages = optimisticMessages.filter((m) => !serverContents.has(m.content))

      return {
        ...serverDetail,
        messages: [...serverDetail.messages, ...pendingMessages],
      }
    },
    enabled: !!workspaceId && !!conversationId,
  })
}

/**
 * Hook to create a new conversation session in the workspace.
 */
export function useCreateAIConversation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (title?: string) => aiService.createConversation(workspaceId, title),
    onSuccess: (newMeta) => {
      // Add the new conversation metadata to the list cache immediately
      queryClient.setQueryData<ConversationMetadata[]>(
        ["workspace-ai-conversations", workspaceId],
        (old = []) => [newMeta, ...old]
      )
    },
  })
}

/**
 * Hook to send a message to the active AI conversation.
 * Handles optimistic updates and final success reconciliation.
 */
export function useSendAIMessage(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["send-ai-message"],
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      aiService.sendMessage(workspaceId, conversationId, content),

    onMutate: async ({ conversationId, content }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic data
      await queryClient.cancelQueries({
        queryKey: ["workspace-ai-conversation", workspaceId, conversationId],
      })

      const previousConversation = queryClient.getQueryData<ConversationDetail>([
        "workspace-ai-conversation",
        workspaceId,
        conversationId,
      ])

      // Optimistically append the user message
      if (previousConversation) {
        const optimisticUserMessage: Message = {
          id: `msg-temp-${Date.now()}`,
          role: "user",
          content,
          createdAt: new Date().toISOString(),
          status: "sending",
        }

        queryClient.setQueryData<ConversationDetail>(
          ["workspace-ai-conversation", workspaceId, conversationId],
          {
            ...previousConversation,
            messages: [...previousConversation.messages, optimisticUserMessage],
          }
        )
      }

      return { previousConversation }
    },

    onError: (_err, variables, context) => {
      // Rollback to previous state
      if (context?.previousConversation) {
        queryClient.setQueryData(
          ["workspace-ai-conversation", workspaceId, variables.conversationId],
          context.previousConversation
        )
      }
    },

    onSuccess: (finalDetail, variables) => {
      // Update the cache with final messages (user sent status + assistant response)
      queryClient.setQueryData(
        ["workspace-ai-conversation", workspaceId, variables.conversationId],
        finalDetail
      )

      // Refresh the conversations list to update previews and titles
      queryClient.invalidateQueries({
        queryKey: ["workspace-ai-conversations", workspaceId],
      })
    },
  })
}
