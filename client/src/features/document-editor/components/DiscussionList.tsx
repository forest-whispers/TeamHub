import { useState } from "react"
import { useDiscussions } from "../hooks/useDiscussions"
import { DiscussionCard } from "./DiscussionCard"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { AlertCircle, MessageSquarePlus, RefreshCw } from "lucide-react"

interface DiscussionListProps {
  workspaceId: string
  documentId: string
  activeDiscussionId?: string | null
  onSelectDiscussion: (discussionId: string) => void
}

export function DiscussionList({
  workspaceId,
  documentId,
  activeDiscussionId,
  onSelectDiscussion,
}: DiscussionListProps) {
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all")

  const {
    data: discussions = [],
    isLoading,
    isError,
    refetch,
  } = useDiscussions(workspaceId, documentId, Boolean(workspaceId && documentId))

  const filteredDiscussions = discussions.filter((discussion: any) => {
    if (filter === "open") return !discussion.resolved
    if (filter === "resolved") return discussion.resolved
    return true
  })

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full text-left select-none">
      {/* Filter Header */}
      <div className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-card">
        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-md border border-border/40 text-[11px] font-semibold">
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filter === "all" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({discussions.length})
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filter === "open" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Open ({discussions.filter((d: any) => !d.resolved).length})
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filter === "resolved" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Resolved ({discussions.filter((d: any) => d.resolved).length})
          </button>
        </div>

        <button
          onClick={() => refetch()}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors cursor-pointer"
          title="Refresh Discussions"
        >
          <RefreshCw className="size-3.5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col items-center text-center gap-2 my-4">
            <AlertCircle className="size-6 text-destructive" />
            <p className="text-xs text-destructive font-medium">Failed to load document discussions</p>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer mt-1">
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredDiscussions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
            <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center border border-border">
              <MessageSquarePlus className="size-5 text-muted-foreground" />
            </div>
            <h4 className="text-xs font-semibold text-foreground">
              {filter === "all"
                ? "No discussions yet"
                : filter === "open"
                ? "No open discussions"
                : "No resolved discussions"}
            </h4>
            <p className="text-[11px] text-muted-foreground max-w-50">
              Select text in the editor to start a discussion.
            </p>
          </div>
        )}

        {/* Discussion Cards */}
        {!isLoading &&
          !isError &&
          filteredDiscussions.map((discussion: any) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              isActive={activeDiscussionId === discussion.id}
              onClick={() => onSelectDiscussion(discussion.id)}
            />
          ))}
      </div>
    </div>
  )
}