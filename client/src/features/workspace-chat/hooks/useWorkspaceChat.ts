import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { workspaceChatService } from "../services/workspaceChatService"
import type { SendMessagePayload } from "../types"

export function useWorkspaceChannels(workspaceId: string) {
  return useQuery({
    queryKey: ["workspace-chat-channels", workspaceId],
    queryFn: () => workspaceChatService.getChannels(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useWorkspaceMessages(workspaceId: string, channelId: string) {
  return useQuery({
    queryKey: ["workspace-chat-messages", workspaceId, channelId],
    queryFn: () => workspaceChatService.getMessages(workspaceId, channelId),
    enabled: !!workspaceId && !!channelId,
  })
}

export function useSendMessage(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      workspaceChatService.sendMessage(workspaceId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-chat-messages", workspaceId, data.channelId],
      })
    },
  })
}
