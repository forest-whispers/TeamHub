import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { X, Columns, Sparkles } from "lucide-react"
import {
  useWorkspaceAIConversations,
  useAIConversation,
  useCreateAIConversation,
  useSendAIMessage,
} from "../hooks/useAI"
import { ConversationList } from "./ConversationList"
import { ConversationMessage } from "./ConversationMessage"
import { SuggestedPromptList } from "./SuggestedPromptList"
import { PromptComposer } from "./PromptComposer"
import { TypingIndicator } from "./TypingIndicator"
import type { Message } from "../types"

interface AssistantPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const { workspaceId = "ws-1" } = useParams<{ workspaceId: string }>()
  
  const [activeConversationId, setActiveConversationId] = useState<string>("")
  const [showSidebar, setShowSidebar] = useState<boolean>(true)
  const [inputQuery, setInputQuery] = useState<string>("")
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch list of conversations
  const {
    data: conversations = [],
    isLoading: isListLoading,
    isError: isListError,
    refetch: refetchList,
  } = useWorkspaceAIConversations(workspaceId)

  // Fetch active conversation detail
  const {
    data: conversationDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useAIConversation(workspaceId, activeConversationId)

  // Create conversation mutation
  const createConversationMutation = useCreateAIConversation(workspaceId)

  // Send message mutation
  const sendMessageMutation = useSendAIMessage(workspaceId)

  // Auto-select the first conversation if none selected
  useEffect(() => {
    if (isOpen && conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id)
    }
  }, [isOpen, conversations, activeConversationId])

  // Scroll to bottom when messages or typing indicator changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow render completion
      const timer = setTimeout(scrollToBottom, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, conversationDetail?.messages?.length, sendMessageMutation.isPending])

  if (!isOpen) return null

  // Start new conversation session
  const handleCreateNewChat = async () => {
    try {
      const newMeta = await createConversationMutation.mutateAsync(undefined)
      setActiveConversationId(newMeta.id)
      setInputQuery("")
    } catch (e) {
      console.error("Failed to create conversation:", e)
    }
  }

  // Handle message sending
  const handleSendMessage = async () => {
    const trimmed = inputQuery.trim()
    if (!trimmed || !activeConversationId) return

    setInputQuery("")
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        content: trimmed,
      })
    } catch (e) {
      console.error("Failed to send message:", e)
    }
  }

  // Select a prompt template
  const handleSelectSuggestedPrompt = (prompt: string) => {
    setInputQuery(prompt)
  }

  // Retry sending a message
  const handleRetryMessage = async (failedMessage: Message) => {
    if (!activeConversationId) return
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        content: failedMessage.content,
      })
    } catch (e) {
      console.error("Failed to retry message:", e)
    }
  }

  const messages = conversationDetail?.messages || []

  return (
    <>
      {/* Mobile dim backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/45 backdrop-blur-xs md:hidden"
        onClick={onClose}
      />

      {/* Main Panel Wrapper */}
      <div
        className="fixed inset-y-0 right-0 z-40 flex w-full md:w-[480px] lg:w-[680px] bg-card border-l border-border shadow-2xl animate-in slide-in-from-right duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Sidebar (Collapsible History List) */}
        {showSidebar && (
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onCreateNew={handleCreateNewChat}
            isCreating={createConversationMutation.isPending}
          />
        )}

        {/* Right: Main Conversation Interface */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
          {/* Header Panel Bar */}
          <div className="h-13 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card select-none">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
                title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
              >
                <Columns className="size-4.5" />
              </button>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Sparkles className="size-4 text-primary shrink-0" />
                <span className="truncate">Workspace AI</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              title="Close Panel"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Conversation Screen Viewport */}
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-background/50">
            {/* Conversations load check (List Loading) */}
            {isListLoading && conversations.length === 0 && (
              <div className="flex-1 flex flex-col justify-center items-center p-6 text-muted-foreground text-xs select-none">
                <div className="animate-pulse flex flex-col items-center gap-2">
                  <div className="size-6 bg-muted rounded-full" />
                  <div className="h-4 bg-muted rounded w-28" />
                </div>
              </div>
            )}

            {/* Conversation detail loading */}
            {isDetailLoading && activeConversationId && <ConversationSkeleton />}

            {/* General List Error */}
            {isListError && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xs text-destructive mb-3">Failed to load AI conversations list.</p>
                <button
                  onClick={() => refetchList()}
                  className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-1.5 text-[11px] font-semibold hover:bg-accent cursor-pointer transition-colors"
                >
                  Retry List Load
                </button>
              </div>
            )}

            {/* Active Conversation Detail Error */}
            {isDetailError && activeConversationId && !isDetailLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-xs text-destructive mb-3">Failed to load conversation details.</p>
                <button
                  onClick={() => refetchDetail()}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer transition-colors"
                >
                  Retry Loading
                </button>
              </div>
            )}

            {/* Prompt suggestions if conversation is empty */}
            {!isDetailLoading && !isDetailError && activeConversationId && messages.length === 0 && (
              <SuggestedPromptList onSelect={handleSelectSuggestedPrompt} />
            )}

            {/* Messages logs list */}
            {!isDetailLoading && !isDetailError && activeConversationId && messages.length > 0 && (
              <div className="flex-1 py-3 overflow-y-auto">
                {messages.map((msg) => (
                  <ConversationMessage
                    key={msg.id}
                    message={msg}
                    onRetry={handleRetryMessage}
                  />
                ))}

                {/* Bouncing Typing Indicator bubble */}
                {sendMessageMutation.isPending && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Screen if no conversation selected */}
            {!activeConversationId && !isListLoading && !isListError && (
              <div className="flex-1 flex flex-col justify-center items-center p-6 text-center select-none text-muted-foreground">
                <Sparkles className="size-8 text-muted-foreground/30 mb-3" />
                <p className="text-xs max-w-[240px] leading-relaxed">
                  No active conversation. Start a new chat session to coordinate.
                </p>
                <button
                  onClick={handleCreateNewChat}
                  className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 cursor-pointer"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>

          {/* Composer Panel */}
          {activeConversationId && (
            <PromptComposer
              value={inputQuery}
              onChange={setInputQuery}
              onSubmit={handleSendMessage}
              disabled={sendMessageMutation.isPending}
            />
          )}
        </div>
      </div>
    </>
  )
}

function ConversationSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-5 overflow-y-auto select-none">
      <div className="flex items-start gap-3">
        <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-9 bg-muted/65 animate-pulse rounded-2xl rounded-tl-none w-2/3" />
        </div>
      </div>
      <div className="flex items-start gap-3 flex-row-reverse">
        <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="space-y-2 flex-1 flex flex-col items-end">
          <div className="h-9 bg-muted/65 animate-pulse rounded-2xl rounded-tr-none w-1/2" />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-12 bg-muted/65 animate-pulse rounded-2xl rounded-tl-none w-3/4" />
        </div>
      </div>
    </div>
  )
}
