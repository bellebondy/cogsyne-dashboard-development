"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

type Period = "30d" | "90d"

const trendData: Record<Period, { week: string; readiness: number }[]> = {
  "30d": [
    { week: "Oct 15", readiness: 58 },
    { week: "Oct 22", readiness: 61 },
    { week: "Oct 29", readiness: 62 },
    { week: "Nov 5", readiness: 67 },
    { week: "Nov 12", readiness: 71 },
  ],
  "90d": [
    { week: "Aug 14", readiness: 44 },
    { week: "Aug 28", readiness: 48 },
    { week: "Sep 11", readiness: 46 },
    { week: "Sep 25", readiness: 54 },
    { week: "Oct 9", readiness: 58 },
    { week: "Oct 23", readiness: 61 },
    { week: "Nov 6", readiness: 67 },
    { week: "Nov 12", readiness: 71 },
  ],
}

const chartConfig = {
  readiness: { label: "Readiness score", color: "var(--chart-1)" },
} satisfies ChartConfig

export function ReadinessTrend() {
  const [period, setPeriod] = useState<Period>("30d")
  const data = trendData[period]

  return (
    <article className="panel trend-panel">
      <div className="trend-heading">
        <div>
          <div className="overline">DEMO DATA · ILLUSTRATIVE</div>
          <h2>Readiness momentum</h2>
          <div className="trend-value">{data[data.length - 1].readiness}<span>/100</span></div>
          <span className="trend-change"><ArrowUpRight size={13} /> +8 points this month</span>
        </div>
        <div className="trend-period" role="group" aria-label="Select chart period">
          {(["30d", "90d"] as const).map((value) => (
            <button key={value} type="button" aria-pressed={period === value} onClick={() => setPeriod(value)}>
              {value}
            </button>
          ))}
        </div>
      </div>
      <ChartContainer config={chartConfig} className="trend-chart" aria-label={`Illustrative readiness score trend over ${period === "30d" ? "30 days" : "90 days"}`}>
        <AreaChart accessibilityLayer data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="readiness-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 4" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} ticks={[40, 60, 80, 100]} tickLine={false} axisLine={false} width={30} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Area dataKey="readiness" type="monotone" stroke="var(--color-readiness)" fill="url(#readiness-fill)" strokeWidth={2.5} activeDot={{ r: 4, stroke: "white", strokeWidth: 2 }} />
        </AreaChart>
      </ChartContainer>
      <p className="trend-caption">Illustrative scores for presentation only. Not live telemetry or a qualification decision.</p>
    </article>
  )
}
