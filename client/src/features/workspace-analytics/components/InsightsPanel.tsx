import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { User, FileText, Zap, Award } from "lucide-react"
import type { InsightItem } from "../types"

interface InsightsPanelProps {
  insights: InsightItem[]
}

const getInsightIcon = (type: InsightItem["type"]) => {
  switch (type) {
    case "member":
      return <User className="size-4 text-violet-500" />
    case "document":
      return <FileText className="size-4 text-blue-500" />
    case "activity":
      return <Zap className="size-4 text-amber-500" />
    default:
      return <Award className="size-4 text-primary" />
  }
}

const getInsightIconBg = (type: InsightItem["type"]) => {
  switch (type) {
    case "member":
      return "bg-violet-500/10 border-violet-500/20"
    case "document":
      return "bg-blue-500/10 border-blue-500/20"
    case "activity":
      return "bg-amber-500/10 border-amber-500/20"
    default:
      return "bg-primary/10 border-primary/20"
  }
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <Card className="border border-border bg-card/45 select-none text-left">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Workspace Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <span className="text-xs text-muted-foreground">No insights available for this period.</span>
          </div>
        ) : (
          insights.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-start border border-border/40 rounded-lg p-3 bg-background/30 hover:bg-background/60 transition-colors duration-150"
            >
              <div
                className={`size-8 rounded-lg border flex items-center justify-center shrink-0 ${getInsightIconBg(
                  item.type
                )}`}
              >
                {getInsightIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {item.label}
                </span>
                <span className="text-xs font-semibold text-foreground block truncate">
                  {item.value}
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
