import type { ReactNode } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
  icon?: ReactNode
}

export function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  const getTrendBadge = () => {
    switch (trend) {
      case "up":
        return (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full select-none leading-none">
            <ArrowUpRight className="size-3 shrink-0" />
            {change}
          </span>
        )
      case "down":
        return (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full select-none leading-none">
            <ArrowDownRight className="size-3 shrink-0" />
            {change}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted/10 border border-muted/20 px-1.5 py-0.5 rounded-full select-none leading-none">
            <Minus className="size-3 shrink-0" />
            {change}
          </span>
        )
    }
  }

  return (
    <Card className="border border-border bg-card/45 hover:bg-card hover:shadow-sm transition-all duration-200 text-left select-none">
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground truncate">
              {value}
            </span>
            {getTrendBadge()}
          </div>
        </div>
        {icon && (
          <div className="size-10 rounded-lg flex items-center justify-center bg-primary/5 border border-primary/10 text-primary shrink-0">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
