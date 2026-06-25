export interface MetricData {
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
  label: string
}

export interface SummaryMetrics {
  totalDocuments: MetricData
  totalMembers: MetricData
  totalFiles: MetricData
  recentActivity: MetricData
}

export interface ChartPoint {
  label: string
  value: number
}

export interface ChartData {
  documentsCreated: ChartPoint[]
  workspaceActivity: ChartPoint[]
  fileUploads: ChartPoint[]
}

export interface InsightItem {
  id: string
  type: "member" | "document" | "activity"
  label: string
  value: string
  description: string
}

export interface WorkspaceAnalyticsData {
  metrics: SummaryMetrics
  charts: ChartData
  insights: InsightItem[]
}
