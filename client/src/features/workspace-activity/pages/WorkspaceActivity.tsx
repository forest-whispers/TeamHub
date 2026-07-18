import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useWorkspaceActivities } from "../hooks/useWorkspaceActivities"
import { ActivityTimeline } from "../components/ActivityTimeline"
import { formatActivity } from "@/shared/lib/activityFormatter"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import { Search, Filter, AlertCircle, History, Inbox, HelpCircle } from "lucide-react"

export default function WorkspaceActivity() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const {
    data: activities,
    isLoading,
    error,
    refetch,
  } = useWorkspaceActivities(workspaceId || "")

  const formattedActivities = useMemo(
    () => (activities ?? []).map(formatActivity),
    [activities]
  );

  // Unique activity types extracted from loaded activities list for filter choices
  const typeOptions = useMemo(() => {
    if (!activities) return []
    const types = new Set(formattedActivities.map((a) => a.category))
    return Array.from(types).sort()
  }, [activities])

  // Client-side search and filtering maintaining original reverse-chronological ordering
  const filteredActivities = useMemo(() => {
    if (!activities) return []
    return formattedActivities.filter((activity) => {
      const actorText = activity.actor || ""
      const targetText = activity.target || ""
      const actionText = activity.action || ""

      const matchesSearch =
        actorText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        targetText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        actionText.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType =
        typeFilter === "all" ||
        activity.category.toLowerCase() === typeFilter.toLowerCase()

      return matchesSearch && matchesType
    })
  }, [activities, searchQuery, typeFilter])

  // Helper to map category identifiers to user-friendly titles
  const formatTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case "document":
        return "Documents"
      case "comment":
        return "Comments"
      case "member":
        return "Members"
      case "workspace":
        return "Workspaces"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-left select-none">
      {/* Header Container */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="size-5 text-primary" />
          Workspace Activity
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Chronological logs of collaboration updates and changes made within this workspace
        </p>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search activity by actor, action, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Activity Category Filter dropdown */}
        <SelectDropdown
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            ...typeOptions.map((type) => ({
              value: type.toLowerCase(),
              label: formatTypeLabel(type),
            })),
          ]}
          icon={<Filter className="size-3.5" />}
        />
      </div>

      {/* Loading Skeleton indicators */}
      {isLoading && (
        <div className="space-y-6 pl-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <Skeleton className="size-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 pt-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fetching Error State view */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
            <span className="text-sm text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              Failed to load workspace activity history.
            </span>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loaded Activities timeline display */}
      {!isLoading && !error && activities && (
        <>
          {filteredActivities.length === 0 ? (
            /* Empty State layouts */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-xl bg-card/25 min-h-75">
              {activities.length === 0 ? (
                <>
                  <Inbox className="size-12 text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No activity logs</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    Collaborative activity hasn't been logged in this workspace yet. Create documents or invite members to get started.
                  </p>
                </>
              ) : (
                <>
                  <HelpCircle className="size-12 text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No matches found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    Your search query or activity filter didn't match any logged timeline records.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setTypeFilter("all")
                    }}
                    size="xs"
                    variant="outline"
                    className="mt-4 cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            /* Vertical Timeline component wrapper */
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <ActivityTimeline activities={filteredActivities} />
            </div>
          )}
        </>
      )}
    </div>
  )
}