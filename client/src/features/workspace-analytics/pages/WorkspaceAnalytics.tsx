import { useState } from "react"
import { useParams } from "react-router-dom"
import { useWorkspaceAnalytics } from "../hooks/useWorkspaceAnalytics"
import { MetricCard } from "../components/MetricCard"
import { AnalyticsChart } from "../components/AnalyticsChart"
import { InsightsPanel } from "../components/InsightsPanel"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { FileText, Users, HardDrive, Activity, Calendar, BarChart3, AlertCircle, RefreshCw } from "lucide-react"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"

export default function WorkspaceAnalytics() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [timeRange, setTimeRange] = useState("7d")

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useWorkspaceAnalytics(workspaceId || "", timeRange)

  // Determine if analytics has returned empty metrics
  const isEmpty =
    !data ||
    (data.metrics.totalDocuments.value === 0 &&
      data.metrics.totalMembers.value === 0 &&
      data.metrics.totalFiles.value === 0 &&
      data.metrics.recentActivity.value === 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-left select-none">
      {/* Header Container (Persistent, never remounts) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics</h1>
            {isFetching && !isLoading && (
              <RefreshCw className="size-3 text-muted-foreground animate-spin shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            View activity metrics, data trends, and workspace insights
          </p>
        </div>

        {/* Range Selector Controls */}
        <SelectDropdown
          value={timeRange}
          onChange={setTimeRange}
          options={[
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
            { value: "90d", label: "Last 90 Days" },
          ]}
          icon={<Calendar className="size-3.5" />}
          className="w-full sm:w-44"
          align="right"
        />
      </div>

      {/* Skeletons Layout */}
      {isLoading && (
        <div className="space-y-6">
          {/* Summary Metrics Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} className="border border-border/50 bg-card/45">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="size-10 rounded-lg shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts & Insights Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-border/50 bg-card/45 h-67.5 p-4 flex flex-col justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-45 w-full" />
              </Card>
              <Card className="border border-border/50 bg-card/45 h-67.5 p-4 flex flex-col justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-45 w-full" />
              </Card>
            </div>
            <div>
              <Card className="border border-border/50 bg-card/45 h-141 p-4 flex flex-col justify-between">
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="space-y-3 flex-1">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="flex gap-3 items-start border border-border/20 rounded-lg p-3">
                      <Skeleton className="size-8 rounded-lg shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
            <span className="text-sm text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              Failed to load workspace analytics.
            </span>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && isEmpty && (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-xl bg-card/25 min-h-100">
          <BarChart3 className="size-12 text-muted-foreground/60 mb-3" />
          <h3 className="text-sm font-bold text-foreground">No analytics data available</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
            There is no activity or usage statistics logged for this time range yet. Try resetting the filters.
          </p>
          <Button onClick={() => setTimeRange("7d")} size="xs" variant="outline" className="mt-4 cursor-pointer">
            Reset to Last 7 Days
          </Button>
        </div>
      )}

      {/* Content Layout */}
      {!isLoading && !error && !isEmpty && data && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title={data.metrics.totalDocuments.label}
              value={data.metrics.totalDocuments.value}
              change={data.metrics.totalDocuments.change}
              trend={data.metrics.totalDocuments.trend}
              icon={<FileText className="size-5" />}
            />
            <MetricCard
              title={data.metrics.totalMembers.label}
              value={data.metrics.totalMembers.value}
              change={data.metrics.totalMembers.change}
              trend={data.metrics.totalMembers.trend}
              icon={<Users className="size-5" />}
            />
            <MetricCard
              title={data.metrics.totalFiles.label}
              value={data.metrics.totalFiles.value}
              change={data.metrics.totalFiles.change}
              trend={data.metrics.totalFiles.trend}
              icon={<HardDrive className="size-5" />}
            />
            <MetricCard
              title={data.metrics.recentActivity.label}
              value={data.metrics.recentActivity.value}
              change={data.metrics.recentActivity.change}
              trend={data.metrics.recentActivity.trend}
              icon={<Activity className="size-5" />}
            />
          </div>

          {/* Charts & Insights Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visualizations Column */}
            <div className="lg:col-span-2 space-y-6">
              <AnalyticsChart
                title="Documents Created"
                data={data.charts.documentsCreated}
                type="line"
                colorClass="blue"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalyticsChart
                  title="Workspace Activity"
                  data={data.charts.workspaceActivity}
                  type="bar"
                  colorClass="emerald"
                />
                <AnalyticsChart
                  title="File Uploads"
                  data={data.charts.fileUploads}
                  type="line"
                  colorClass="violet"
                />
              </div>
            </div>

            {/* Insights Panel Column */}
            <div className="h-full">
              <InsightsPanel insights={data.insights} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}