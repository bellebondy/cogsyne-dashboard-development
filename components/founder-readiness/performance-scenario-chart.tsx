"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import { demoScenario } from "@/lib/founder-demo-data"
import { DataSourceBadge } from "./shared"

const comparison = [
  { label: "Baseline", value: demoScenario.baselineMinutes, key: "baseline" },
  { label: "Target", value: demoScenario.targetMinutes, key: "target" },
  { label: "Observed", value: demoScenario.observedMinutes, key: "observed" },
]

const chartConfig = {
  baseline: { label: "Baseline", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
  observed: { label: "Observed", color: "var(--chart-3)" },
  minutes: { label: "Minutes per case" },
} satisfies ChartConfig

export function PerformanceScenarioChart() {
  return (
    <article className="panel trend-panel">
      <div className="trend-heading"><div><div className="overline">SIMULATED · MINUTES PER CASE</div><h2>Performance scenario</h2></div><DataSourceBadge source="SIMULATED" /></div>
      <ChartContainer config={chartConfig} className="trend-chart" aria-label="Simulated case handling time: baseline 10 minutes, target 8 minutes, observed 9 minutes">
        <BarChart accessibilityLayer data={comparison} layout="vertical" margin={{ top: 8, right: 18, left: 4, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" strokeDasharray="3 4" />
          <XAxis type="number" domain={[0, 11]} tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={72} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
          <Bar dataKey="value" name="Minutes per case" radius={[0, 6, 6, 0]}>
            {comparison.map((item) => <Cell key={item.key} fill={`var(--color-${item.key})`} />)}
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="trend-caption">Local fixture only · observed result is 1 minute above target. Not live telemetry.</p>
    </article>
  )
}
