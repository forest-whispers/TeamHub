import { FileText, MessageSquare, UserPlus, Settings, Globe } from "lucide-react"
import type { FormattedActivity } from "../types/ui";
import { formatActivityTime } from "@/shared/lib/activityTime";

interface ActivityItemProps {
  activity: FormattedActivity
  isLast: boolean
}

export function ActivityItem({ activity, isLast }: ActivityItemProps) {
  // Activity icon mapping helper
  const getActivityIcon = (category: FormattedActivity["category"]) => {
    switch (category) {
      case "document":
        return <FileText className="size-4 text-sky-500" />
      case "comment":
        return <MessageSquare className="size-4 text-emerald-500" />
      case "member":
        return <UserPlus className="size-4 text-violet-500" />
      case "workspace":
        return <Settings className="size-4 text-amber-500" />
      default:
        return <Globe className="size-4 text-muted-foreground" />
    }
  };

  // Activity background color mappings
  const getActivityBgColor = (category: FormattedActivity["category"]) => {
    switch (category) {
      case "document":
        return "bg-sky-500/10 border-sky-500/20"
      case "comment":
        return "bg-emerald-500/10 border-emerald-500/20"
      case "member":
        return "bg-violet-500/10 border-violet-500/20"
      case "workspace":
        return "bg-amber-500/10 border-amber-500/20"
      default:
        return "bg-muted/10 border-border"
    }
  };

  return (
    <div className="flex gap-4 items-start select-none">
      {/* Timeline Node & Connecting Line wrapper */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`size-8 rounded-full flex items-center justify-center border ${getActivityBgColor(activity.category)}`}>
          {getActivityIcon(activity.category)}
        </div>
        {/* Draw vertical connecting line unless it's the last timeline node */}
        {!isLast && (
          <div className="w-[1.5px] min-h-9 flex-1 bg-border/60 my-1" />
        )}
      </div>

      {/* Activity Details Box */}
      <div className="min-w-0 flex-1 pt-1">
        <div className="text-sm leading-relaxed text-foreground text-left">
          <span className="font-bold text-foreground mr-1.25">
            {activity.actor.toLocaleUpperCase()}
          </span>
          <span className="text-muted-foreground">
            {activity.action}
          </span>
          <span className="font-bold text-foreground bg-muted/60 border border-border/40 rounded py-0.5 mx-1.25">
            {activity.target.toLocaleUpperCase()}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground font-semibold lowercase tracking-wider mt-1 text-left">
          {formatActivityTime(activity.timestamp)}
        </p>
      </div>
    </div>
  )
}