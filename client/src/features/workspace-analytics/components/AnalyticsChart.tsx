import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface ChartPoint {
  label: string
  value: number
}

interface AnalyticsChartProps {
  title: string
  data: ChartPoint[]
  type: "line" | "bar"
  colorClass?: "blue" | "emerald" | "violet"
}

export function AnalyticsChart({ title, data, type, colorClass = "blue" }: AnalyticsChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  if (!data || data.length === 0) {
    return (
      <Card className="border border-border bg-card/45 select-none h-[280px] flex items-center justify-center text-left">
        <div className="text-center p-4">
          <span className="text-xs text-muted-foreground">No data available for this range</span>
        </div>
      </Card>
    )
  }

  // Dimensions
  const svgWidth = 500
  const svgHeight = 200
  const paddingLeft = 45
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 30

  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom
  const zeroY = svgHeight - paddingBottom

  const values = data.map((d) => d.value)
  const maxVal = Math.max(...values, 5) // ensure at least 5 as peak for scale

  // Color profiles
  const colorMap = {
    blue: {
      stroke: "stroke-blue-500",
      fill: "fill-blue-500/10",
      solidFill: "fill-blue-500",
    },
    emerald: {
      stroke: "stroke-emerald-500",
      fill: "fill-emerald-500/10",
      solidFill: "fill-emerald-500",
    },
    violet: {
      stroke: "stroke-violet-500",
      fill: "fill-violet-500/10",
      solidFill: "fill-violet-500",
    },
  }

  const profile = colorMap[colorClass] || colorMap.blue

  // Coordinate math
  const n = data.length
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(n - 1, 1)) * chartWidth
    const y = zeroY - (d.value / maxVal) * chartHeight
    return { x, y, label: d.label, value: d.value }
  })

  // Generate SVG path for line/area
  let linePath = ""
  let areaPath = ""
  if (type === "line" && points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
    areaPath = `${linePath} L ${points[points.length - 1].x} ${zeroY} L ${points[0].x} ${zeroY} Z`
  }

  // Bar math
  const colWidth = chartWidth / n
  const barWidth = colWidth * 0.55

  return (
    <Card className="border border-border bg-card/45 select-none text-left overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="h-6 flex items-center">
          {hoveredIdx !== null ? (
            <div className="text-[11px] font-bold text-foreground bg-primary/10 border border-primary/20 px-2 py-0.5 rounded transition-all duration-150">
              {data[hoveredIdx].label}: <span className="text-primary">{data[hoveredIdx].value}</span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">Hover details</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
            {/* Gridlines */}
            {[0, 0.5, 1].map((ratio) => {
              const yVal = zeroY - ratio * chartHeight
              const displayVal = Math.round(ratio * maxVal)
              return (
                <g key={ratio} className="opacity-40">
                  <line
                    x1={paddingLeft}
                    y1={yVal}
                    x2={svgWidth - paddingRight}
                    y2={yVal}
                    stroke="currentColor"
                    className="text-border"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={yVal + 3}
                    textAnchor="end"
                    className="text-[9px] fill-muted-foreground font-semibold"
                  >
                    {displayVal}
                  </text>
                </g>
              )
            })}

            {/* Render Area/Line Chart */}
            {type === "line" && (
              <>
                <path d={areaPath} className={`${profile.fill} transition-all duration-300`} />
                <path
                  d={linePath}
                  fill="none"
                  strokeWidth="2"
                  className={`${profile.stroke} transition-all duration-300`}
                />
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredIdx === i ? 5 : 3}
                      className={`${profile.solidFill} stroke-background stroke-2 cursor-pointer transition-all duration-150`}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                    {/* Invisible hover trigger zone */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={15}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  </g>
                ))}
              </>
            )}

            {/* Render Bar Chart */}
            {type === "bar" &&
              points.map((p, i) => {
                const barX = paddingLeft + i * colWidth + (colWidth - barWidth) / 2
                const barHeight = (p.value / maxVal) * chartHeight
                const barY = zeroY - barHeight

                return (
                  <g key={i}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      rx={2}
                      className={`${
                        hoveredIdx === i ? "opacity-100 fill-primary" : `${profile.solidFill} opacity-85`
                      } transition-all duration-200 cursor-pointer`}
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                    {/* Invisible hover trigger zone */}
                    <rect
                      x={paddingLeft + i * colWidth}
                      y={paddingTop}
                      width={colWidth}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(i)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    />
                  </g>
                )
              })}

            {/* X-Axis Labels */}
            {points.map((p, i) => {
              const labelX = type === "bar" ? paddingLeft + i * colWidth + colWidth / 2 : p.x

              return (
                <text
                  key={i}
                  x={labelX}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className="text-[9px] fill-muted-foreground font-semibold"
                >
                  {p.label}
                </text>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
