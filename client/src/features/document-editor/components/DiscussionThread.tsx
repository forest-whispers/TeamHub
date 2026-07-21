import { useState, useRef, useEffect } from "react"
import { intlFormatDistance } from "date-fns"
import type { DocumentDiscussion } from "../types/discussion"
import type { AuthUser } from "@/features/auth/types"
import {
  useReplyDiscussion,
  useResolveDiscussion,
  useDeleteDiscussion,
  useDeleteReply,
} from "../hooks/useDiscussions"
import { Button } from "@/shared/components/ui/button"
import { CheckCircle2, RotateCcw, Trash2, X, Send, Loader2, } from "lucide-react"
import { toast } from "sonner"

interface DiscussionThreadProps {
  workspaceId: string
  documentId: string
  discussion: DocumentDiscussion
  authUser?: AuthUser
  anchorRect?: { top: number; left: number } | null
  onClose: () => void
}

export function DiscussionThread({
  workspaceId,
  documentId,
  discussion,
  authUser,
  anchorRect,
  onClose,
}: DiscussionThreadProps) {
  const [replyMessage, setReplyMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const replyMutation = useReplyDiscussion(workspaceId, documentId)
  const resolveMutation = useResolveDiscussion(workspaceId, documentId)
  const deleteDiscussionMutation = useDeleteDiscussion(workspaceId, documentId)
  const deleteReplyMutation = useDeleteReply(workspaceId, documentId)

  const isCreator = authUser?.id === discussion.createdBy?.id

  // Close on Escape key if no unsaved reply
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!replyMessage.trim()) {
          onClose()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [replyMessage, onClose])

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = replyMessage.trim()
    if (!trimmed || replyMutation.isPending) return

    replyMutation.mutate(
      {
        discussionId: discussion.id,
        payload: { message: trimmed },
      },
      {
        onSuccess: () => {
          setReplyMessage("")
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to add reply")
        },
      }
    )
  }

  const handleToggleResolve = () => {
    if (!isCreator || resolveMutation.isPending) return

    resolveMutation.mutate(
      {
        discussionId: discussion.id,
        payload: { resolved: !discussion.resolved },
      },
      {
        onSuccess: () => {
          toast.success(discussion.resolved ? "Discussion reopened" : "Discussion resolved")
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update discussion status")
        },
      }
    )
  }

  const handleDeleteDiscussion = () => {
    if (!isCreator || deleteDiscussionMutation.isPending) return
    if (!window.confirm("Are you sure you want to delete this discussion?")) return

    deleteDiscussionMutation.mutate(discussion.id, {
      onSuccess: () => {
        toast.success("Discussion deleted")
        onClose()
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete discussion")
      },
    })
  }

  const handleDeleteReply = (replyId: string) => {
    if (deleteReplyMutation.isPending) return

    deleteReplyMutation.mutate(replyId, {
      onSuccess: () => {
        toast.success("Reply deleted")
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to delete reply")
      },
    })
  }

  const getInitials = (name: string) => {
    return (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div
      className="absolute top-3 right-3 sm:top-4 sm:right-4 w-80 sm:w-84 max-w-[calc(100vw-2rem)] bg-popover text-popover-foreground border border-border shadow-xl rounded-xl p-3.5 space-y-3 z-40 text-left animate-in fade-in-50 slide-in-from-top-2 duration-150 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/20 shrink-0">
            {discussion.createdBy?.avatar ? (
              <img src={discussion.createdBy.avatar} alt="" className="size-full rounded-full object-cover" />
            ) : (
              getInitials(discussion.createdBy?.name || "User")
            )}
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="text-xs font-bold text-foreground truncate">{discussion.createdBy?.name}</span>
            <span className="text-[9px] text-muted-foreground">
              {intlFormatDistance(new Date(discussion.createdAt), new Date(), { style: "short" })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {discussion.resolved && (
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Resolved
            </span>
          )}

          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted cursor-pointer transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Quoted Snippet */}
      {discussion.quotedText && (
        <div className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2 py-1 bg-muted/40 rounded-r max-h-16 overflow-y-auto">
          "{discussion.quotedText}"
        </div>
      )}

      {/* Replies Thread - Fits ~2-3 comments then becomes scrollable */}
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {discussion.replies && discussion.replies.length > 0 ? (
          discussion.replies.map((reply) => {
            const isReplyAuthor = authUser?.id === reply.createdBy?.id
            return (
              <div key={reply.id} className="p-2 rounded-lg bg-muted/30 border border-border/40 space-y-1 group">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] border border-primary/20 shrink-0">
                      {reply.createdBy?.avatar ? (
                        <img src={reply.createdBy.avatar} alt="" className="size-full rounded-full object-cover" />
                      ) : (
                        getInitials(reply.createdBy?.name || "User")
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-foreground truncate">
                      {reply.createdBy?.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {intlFormatDistance(new Date(reply.createdAt), new Date(), { style: "short" })}
                    </span>
                  </div>

                  {isReplyAuthor && (
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      disabled={deleteReplyMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                      title="Delete reply"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-foreground/90 pl-6 whitespace-pre-wrap">{reply.message}</p>
              </div>
            )
          })
        ) : (
          <div className="text-center py-2 text-xs text-muted-foreground">No replies yet</div>
        )}
      </div>

      {/* Creator Action Controls */}
      {isCreator && (
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleToggleResolve}
            disabled={resolveMutation.isPending}
            className="cursor-pointer text-xs h-7 px-2 font-medium"
          >
            {resolveMutation.isPending ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : discussion.resolved ? (
              <RotateCcw className="size-3 mr-1 text-amber-500" />
            ) : (
              <CheckCircle2 className="size-3 mr-1 text-emerald-500" />
            )}
            {discussion.resolved ? "Reopen" : "Resolve"}
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleDeleteDiscussion}
            disabled={deleteDiscussionMutation.isPending}
            className="cursor-pointer text-xs h-7 px-2 font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {deleteDiscussionMutation.isPending ? (
              <Loader2 className="size-3 animate-spin mr-1" />
            ) : (
              <Trash2 className="size-3 mr-1" />
            )}
            Delete
          </Button>
        </div>
      )}

      {/* Add Reply Input */}
      {!discussion.resolved && (
        <form onSubmit={handleSendReply} className="flex items-center gap-1.5 pt-1">
          <input
            ref={inputRef}
            type="text"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Reply..."
            disabled={replyMutation.isPending}
            className="flex-1 text-xs px-2.5 py-1.5 rounded-md bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Button
            type="submit"
            size="xs"
            disabled={!replyMessage.trim() || replyMutation.isPending}
            className="cursor-pointer h-7 px-2 shrink-0"
          >
            {replyMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
          </Button>
        </form>
      )}
    </div>
  )
}