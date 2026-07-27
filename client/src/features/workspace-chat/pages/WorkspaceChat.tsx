import { useState, useMemo, useEffect } from "react"
import { useParams, useOutletContext, useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus"
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace"
import {
  useWorkspaceChannels,
  useWorkspaceMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  usePinMessage,
  useUnpinMessage,
  useToggleReaction,
  useLoadMoreMessages,
} from "../hooks/useWorkspaceChat"
import { useWorkspaceChatRealtime } from "../hooks/useWorkspaceChatRealtime"
import { ChannelList } from "../components/ChannelList"
import { MessageList } from "../components/MessageList"
import { MessageComposer } from "../components/MessageComposer"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Input } from "@/shared/components/ui/input"
import type { Message } from "../types"
import {
  Search,
  Settings,
  Hash,
  AlertCircle,
  MessageSquareOff,
  X,
  Menu,
} from "lucide-react"

export default function WorkspaceChat() {
  const { workspaceId, channelId } = useParams<{ workspaceId: string; channelId?: string }>()
  const queryClient = useQueryClient()
  const { selectedChannelId, setSelectedChannelId } = useOutletContext<{
    selectedChannelId: string | null
    setSelectedChannelId: (id: string | null) => void
  }>()

  const navigate = useNavigate()

  useEffect(() => {
    if (selectedChannelId && workspaceId) {
      if (channelId !== selectedChannelId) {
        navigate(`/workspace/${workspaceId}/chat/${selectedChannelId}`, { replace: true })
      }
    }
  }, [selectedChannelId, channelId, navigate, workspaceId])
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileChannelsOpen, setMobileChannelsOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  // Current user details
  const { data: authStatus } = useAuthStatus()
  const currentUserId = authStatus?.user?.id

  // Fetch active workspace to extract members for suggestions and role checks
  const { data: activeWorkspace } = useWorkspace(workspaceId || "")

  const currentMember = activeWorkspace?.members.find((m) => m.id === currentUserId)
  const isAdmin =
    currentMember?.role === "ADMIN" ||
    currentMember?.role === "OWNER" ||
    activeWorkspace?.ownerId === currentUserId

  // Queries & Mutations
  const {
    data: channels,
    isLoading: isChannelsLoading,
    error: channelsError,
    refetch: refetchChannels,
  } = useWorkspaceChannels(workspaceId || "")

  const {
    data: messages,
    isLoading: isMessagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useWorkspaceMessages(workspaceId || "", selectedChannelId || "")

  const sendMessageMutation = useSendMessage(workspaceId || "")
  const editMessageMutation = useEditMessage(workspaceId || "")
  const deleteMessageMutation = useDeleteMessage(workspaceId || "")
  const pinMessageMutation = usePinMessage(workspaceId || "")
  const unpinMessageMutation = useUnpinMessage(workspaceId || "")
  const toggleReactionMutation = useToggleReaction(workspaceId || "")
  const loadMoreMutation = useLoadMoreMessages(workspaceId || "", selectedChannelId || "")

  // Integrate Realtime events
  const { typingUsers, setTyping } = useWorkspaceChatRealtime({
    workspaceId: workspaceId || "",
    documentId: selectedChannelId || "",
  })

  // Auto-select first channel on load
  useEffect(() => {
    if (channels && channels.length > 0) {
      const isValid = channels.some((ch) => ch.id === selectedChannelId)
      if (!isValid) {
        setSelectedChannelId(channels[0].id)
      }
    }
  }, [channels, selectedChannelId])

  // Clear reply state when document channel changes
  useEffect(() => {
    setReplyingTo(null)
  }, [selectedChannelId])

  const selectedChannel = useMemo(() => {
    return channels?.find((ch) => ch.id === selectedChannelId) || null
  }, [channels, selectedChannelId])

  // Pagination availability checks
  const nextCursor = queryClient.getQueryData<string | null>([
    "workspace-chat-messages-cursor",
    workspaceId || "",
    selectedChannelId || "",
  ])
  const hasMore = Boolean(nextCursor)

  // Client-side search filters messages
  const filteredMessages = useMemo(() => {
    if (!messages) return []
    if (!searchQuery.trim()) return messages
    const query = searchQuery.toLowerCase()
    return messages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(query) ||
        msg.sender.name.toLowerCase().includes(query)
    )
  }, [messages, searchQuery])

  // Send message submission handler
  const handleSendMessage = (content: string, replyToId?: string, mentionedUserIds?: string[]) => {
    if (!selectedChannelId) return
    sendMessageMutation.mutate({
      documentId: selectedChannelId,
      payload: {
        content,
        replyToId,
        mentionedUserIds,
      },
    })
    setReplyingTo(null)
  }

  // Edit message handler
  const handleEditMessage = (messageId: string, content: string) => {
    if (!selectedChannelId) return
    // Check members list to build mentionedUserIds
    const mentionedUserIds: string[] = []
    activeWorkspace?.members.forEach((member) => {
      const regex = new RegExp(`@${member.name}\\b`, "gi")
      if (regex.test(content)) {
        mentionedUserIds.push(member.id)
      }
    })

    editMessageMutation.mutate({
      documentId: selectedChannelId,
      messageId,
      payload: {
        content,
        mentionedUserIds,
      },
    })
  }

  // Delete message handler
  const handleDeleteMessage = (messageId: string) => {
    if (!selectedChannelId) return
    deleteMessageMutation.mutate({
      documentId: selectedChannelId,
      messageId,
    })
  }

  // Pin message handler
  const handlePinMessage = (messageId: string) => {
    if (!selectedChannelId) return
    pinMessageMutation.mutate({
      documentId: selectedChannelId,
      messageId,
    })
  }

  // Unpin message handler
  const handleUnpinMessage = (messageId: string) => {
    if (!selectedChannelId) return
    unpinMessageMutation.mutate({
      documentId: selectedChannelId,
      messageId,
    })
  }

  // Toggle reaction handler
  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (!selectedChannelId) return
    toggleReactionMutation.mutate({
      documentId: selectedChannelId,
      messageId,
      emoji,
    })
  }

  // Loading skeleton block for channels list
  const renderChannelsSkeleton = () => (
    <div className="p-3 space-y-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-2 px-3 py-2">
          <Skeleton className="size-4 rounded shrink-0" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )

  // Loading skeleton block for messages area
  const renderMessagesSkeleton = () => (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="flex gap-3 items-start py-2">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="flex gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-12" />
            </div>
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="h-full flex overflow-hidden w-full text-left bg-background">
      {/* Mobile Channel Drawer backdrop */}
      {mobileChannelsOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setMobileChannelsOpen(false)}
        />
      )}

      {/* Channel Sidebar Drawer (Mobile slideout) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border p-4 shadow-lg transform transition-transform duration-200 ease-in-out sm:hidden ${
          mobileChannelsOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
          <span className="text-sm font-semibold tracking-tight">Channels</span>
          <button
            onClick={() => setMobileChannelsOpen(false)}
            className="p-1 hover:bg-muted rounded text-muted-foreground cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {isChannelsLoading ? (
          renderChannelsSkeleton()
        ) : channelsError ? (
          <div className="p-3 text-center space-y-2">
            <span className="text-[11px] text-destructive block">Failed to load channels</span>
            <Button size="xs" variant="outline" onClick={() => refetchChannels()} className="w-full">
              Retry
            </Button>
          </div>
        ) : (
          <ChannelList
            channels={channels || []}
            selectedChannelId={selectedChannelId}
            onSelectChannel={(id) => {
              setSelectedChannelId(id)
              setMobileChannelsOpen(false)
            }}
          />
        )}
      </aside>

      {/* Desktop Channel Sidebar */}
      <aside className="hidden sm:flex flex-col w-56 md:w-64 border-r border-border bg-card/45 shrink-0 overflow-y-auto p-3 space-y-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 select-none">
          Channels
        </span>
        {isChannelsLoading ? (
          renderChannelsSkeleton()
        ) : channelsError ? (
          <div className="p-3 text-center space-y-2">
            <span className="text-[11px] text-destructive block">Failed to load channels</span>
            <Button size="xs" variant="outline" onClick={() => refetchChannels()} className="w-full">
              Retry
            </Button>
          </div>
        ) : (
          <ChannelList
            channels={channels || []}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
          />
        )}
      </aside>

      {/* Main Conversation viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Header Block */}
        <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0 select-none gap-3">
          <div className="flex items-center gap-2 truncate">
            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileChannelsOpen(true)}
              className="sm:hidden p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
            >
              <Menu className="size-4.5" />
            </button>

            {selectedChannel ? (
              <div className="flex items-center gap-1.5 truncate text-foreground font-semibold text-sm">
                <Hash className="size-4 text-muted-foreground/80 shrink-0" />
                <span className="truncate">{selectedChannel.name}</span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">Workspace Chat</span>
            )}
          </div>

          {/* Search Message Box */}
          <div className="flex items-center gap-2 flex-1 max-w-xs justify-end">
            <div className="relative w-full max-w-45 sm:max-w-50">
              <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background/50 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Chat Settings placeholder button */}
            <button
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer shrink-0"
              title="Chat Settings (placeholder)"
            >
              <Settings className="size-4" />
            </button>
          </div>
        </div>

        {/* Message Area viewport */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {isChannelsLoading || isMessagesLoading ? (
            renderMessagesSkeleton()
          ) : channelsError || messagesError ? (
            /* Error display */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
                <span className="text-sm text-destructive font-medium flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    Failed to load conversation messages.
                  </span>
                  <span className="text-xs text-destructive/80 pl-6 font-mono">
                    {((channelsError as any)?.message || (messagesError as any)?.message || "Unknown error")}
                  </span>
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    refetchChannels()
                    refetchMessages()
                  }}
                  className="cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : !channels || channels.length === 0 ? (
            /* Empty channels workspace view */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <MessageSquareOff className="size-12 text-muted-foreground/60 mb-3" />
              <h3 className="text-sm font-bold text-foreground">No channels available</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                There are no active channels in this workspace yet. Try adjusting your overrides.
              </p>
            </div>
          ) : !selectedChannelId ? (
            /* Loading details state fallback */
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs italic">
              Select a channel to begin messaging
            </div>
          ) : filteredMessages.length === 0 && searchQuery.trim() ? (
            /* Search zero results empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <Search className="size-12 text-muted-foreground/60 mb-3" />
              <h3 className="text-sm font-bold text-foreground">No matching messages</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                We couldn't find any messages matching your search query in this channel.
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                size="xs"
                variant="outline"
                className="mt-4 cursor-pointer"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            /* Messages list */
            <MessageList
              messages={filteredMessages}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              hasMore={hasMore}
              isLoadingMore={loadMoreMutation.isPending}
              onLoadMore={() => loadMoreMutation.mutate()}
              onReply={setReplyingTo}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
              onPin={handlePinMessage}
              onUnpin={handleUnpinMessage}
              onToggleReaction={handleToggleReaction}
            />
          )}
        </div>

          {/* Typing indicators */}
          {selectedChannelId && typingUsers.length > 0 && (
            <div className="px-4 py-1 text-[10px] text-muted-foreground italic select-none text-left bg-muted/20 animate-pulse shrink-0">
              {typingUsers.map((u) => u.name).join(", ")}{" "}
              {typingUsers.length === 1 ? "is typing..." : "are typing..."}
            </div>
          )}

        {/* Message Composer docked bottom */}
        {selectedChannelId && !channelsError && !messagesError && channels && channels.length > 0 && (
          <MessageComposer
            onSend={handleSendMessage}
            isSending={sendMessageMutation.isPending}
            onTyping={setTyping}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            members={activeWorkspace?.members.map((m) => ({ id: m.id, name: m.name })) || []}
          />
        )}
      </div>
    </div>
  )
}