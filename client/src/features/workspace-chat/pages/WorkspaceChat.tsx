import { useState, useMemo, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus"
import {
  useWorkspaceChannels,
  useWorkspaceMessages,
  useSendMessage,
} from "../hooks/useWorkspaceChat"
import { ChannelList } from "../components/ChannelList"
import { MessageList } from "../components/MessageList"
import { MessageComposer } from "../components/MessageComposer"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Input } from "@/shared/components/ui/input"
import {
  Search,
  Settings,
  MessageSquare,
  Hash,
  AlertCircle,
  MessageSquareOff,
  X,
  Menu,
} from "lucide-react"

export default function WorkspaceChat() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileChannelsOpen, setMobileChannelsOpen] = useState(false)

  // Current user details
  const { data: authStatus } = useAuthStatus()
  const currentUserName = authStatus?.user?.name || "Alex Developer"
  const currentUserInitials = currentUserName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

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

  // Auto-select first channel on load
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].id)
    }
  }, [channels, selectedChannelId])

  const selectedChannel = useMemo(() => {
    return channels?.find((ch) => ch.id === selectedChannelId) || null
  }, [channels, selectedChannelId])

  // Client-side search filters messages
  const filteredMessages = useMemo(() => {
    if (!messages) return []
    if (!searchQuery.trim()) return messages
    const query = searchQuery.toLowerCase()
    return messages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(query) ||
        msg.sender.toLowerCase().includes(query)
    )
  }, [messages, searchQuery])

  // Send message submission handler
  const handleSendMessage = (content: string) => {
    if (!selectedChannelId) return
    sendMessageMutation.mutate({
      channelId: selectedChannelId,
      sender: currentUserName,
      avatar: currentUserInitials,
      content,
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
            <div className="relative w-full max-w-[180px] sm:max-w-[200px]">
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
                <span className="text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  Failed to load conversation messages.
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
          ) : filteredMessages.length === 0 ? (
            /* Empty state (either empty channel or search filter results) */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              {messages && messages.length > 0 ? (
                /* Search zero results empty state */
                <>
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
                </>
              ) : (
                /* Empty channel empty state */
                <>
                  <MessageSquare className="size-12 text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">Welcome to #{selectedChannel?.name}!</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    This is the start of the #{selectedChannel?.name} channel. Send a message to start conversing with the team.
                  </p>
                </>
              )}
            </div>
          ) : (
            /* Messages list */
            <MessageList messages={filteredMessages} />
          )}
        </div>

        {/* Message Composer docked bottom */}
        {selectedChannelId && !channelsError && !messagesError && channels && channels.length > 0 && (
          <MessageComposer
            onSend={handleSendMessage}
            isSending={sendMessageMutation.isPending}
          />
        )}
      </div>
    </div>
  )
}
