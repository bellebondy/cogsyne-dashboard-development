import type { ReactNode } from "react"
import type { DataSource } from "@/lib/founder-demo-data"

export function DataSourceBadge({ source }: { source: DataSource }) {
  return <span className={`data-source-badge data-source-${source.toLowerCase()}`}>{source}</span>
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="detail-heading">
      <div>
        <div className="overline section-eyebrow">{eyebrow}<DataSourceBadge source="SIMULATED" /></div>
        <h1>{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function ScenarioMetric({ label, value, unit, detail }: { label: string; value: string | number; unit?: string; detail: string }) {
  return (
    <article className="metric-card scenario-metric">
      <div className="metric-top"><span>{label}</span><DataSourceBadge source="SIMULATED" /></div>
      <div className="metric-value">{value}{unit && <small>{unit}</small>}</div>
      <p className="scenario-metric-detail">{detail}</p>
    </article>
  )
}

export function DemoModeBanner() {
  return (
    <div className="global-demo-banner" role="status">
      <strong>DEMO MODE</strong>
      <span>Only SIMULATED scenario fixtures are available. LIVE means an actual response from a running factory service; none are connected and this preview makes no API calls.</span>
    </div>
  )
}
