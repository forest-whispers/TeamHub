import { intlFormatDistance } from "date-fns"
import type { DocumentDiscussion } from "../types/discussion"
import { CheckCircle2, MessageSquare } from "lucide-react"

interface DiscussionCardProps {
  discussion: DocumentDiscussion
  isActive?: boolean
  onClick: () => void
}

export function DiscussionCard({ discussion, isActive, onClick }: DiscussionCardProps) {
  const getInitials = (name: string) => {
    return (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const createdTimeRelative = intlFormatDistance(new Date(discussion.createdAt), new Date(), { style: "short" })

  const replyCount = discussion.replies?.length || 0
  const firstReply = discussion.replies?.[0]
  const latestReply = discussion.replies?.length ? discussion.replies[discussion.replies.length - 1] : null

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all cursor-pointer text-left select-none space-y-2.5 ${
        isActive
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
          : discussion.resolved
          ? "border-border/60 bg-card/50 opacity-75 hover:opacity-100 hover:bg-muted/40"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30 shadow-2xs"
      }`}
    >
      {/* Creator Info & Metadata */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/20 shrink-0">
            {discussion.createdBy?.avatar ? (
              <img src={discussion.createdBy.avatar} alt="" className="size-full rounded-full object-cover" />
            ) : (
              getInitials(discussion.createdBy?.name || "User")
            )}
          </div>
          <span className="text-xs font-semibold text-foreground truncate">
            {discussion.createdBy?.name || "Unknown User"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {discussion.resolved && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              <CheckCircle2 className="size-3" />
              Resolved
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">{createdTimeRelative}</span>
        </div>
      </div>

      {/* Quoted Text Preview */}
      {discussion.quotedText && (
        <div className="text-xs text-muted-foreground italic border-l-2 border-primary/40 pl-2 py-0.5 line-clamp-2 bg-muted/30 rounded-r">
          "{discussion.quotedText}"
        </div>
      )}

      {/* Reply Preview & Count */}
      <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
        <p className="text-foreground/90 font-medium truncate flex-1">
          {latestReply ? latestReply.message : firstReply ? firstReply.message : "No message"}
        </p>

        {replyCount > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 font-medium">
            <MessageSquare className="size-3" />
            <span>{replyCount}</span>
          </div>
        )}
      </div>
    </div>
  )
}