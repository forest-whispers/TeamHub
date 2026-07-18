import { ActivityItem } from "./ActivityItem"
import type { FormattedActivity } from "../types/ui"

interface ActivityTimelineProps {
  activities: FormattedActivity[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="space-y-1 relative">
      {activities.map((activity, index) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isLast={index === activities.length - 1}
        />
      ))}
    </div>
  )
}