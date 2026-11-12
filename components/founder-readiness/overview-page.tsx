import { ArrowDownRight, ArrowRight, ArrowUpRight, CircleHelp, Clock3, FileText, Plus, ShieldCheck, TriangleAlert } from "lucide-react"
import { activityItems, factories, type FactoryId } from "@/lib/founder-demo-data"
import type { ViewId } from "./sidebar"
import { StatusBadge } from "./shared"

export function OverviewPage({ onNavigate, onDemo, searchTerm }: { onNavigate: (id: ViewId) => void; onDemo: () => void; searchTerm: string }) {
  const visibleFactories = factories.filter((factory) => `${factory.id} ${factory.name} ${factory.description} ${factory.owner}`.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div><div className="overline">MONDAY, NOVEMBER 9, 2026 <span className="demo-chip">DEMO DATA</span></div><h1>Good morning, Jordan<span className="title-dot">.</span></h1><p className="page-subtitle">Here&apos;s the latest on your founder readiness workspace.</p></div>
        <button className="button button-dark" onClick={onDemo}><Plus size={16} /> Explore guided demo</button>
      </div>
      <section className="metric-grid" aria-label="Enterprise metrics">
        <Metric label="Readiness score" value="71" suffix="/100" change="+8 pts" icon={<ShieldCheck size={17} />} trend="up" footer="Across 5 core requirements" />
        <Metric label="Requirements met" value="12" suffix="/17" change="2 this week" icon={<FileText size={17} />} trend="up" footer="5 requirements still open" />
        <Metric label="Evidence records" value="28" suffix="" change="3 added" icon={<FileText size={17} />} trend="neutral" footer="Across 4 connected factories" />
        <Metric label="Open sourcing gaps" value="3" suffix="" change="1 high impact" icon={<TriangleAlert size={17} />} trend="warn" footer="2 assigned to your teams" />
      </section>
      <section className="section-block">
        <div className="section-heading"><div><div className="overline">CONNECTED WORKFLOWS</div><h2>Factory overview</h2></div><button className="text-button" onClick={() => onNavigate("F12")}>View readiness summary <ArrowRight size={15} /></button></div>
        <div className="factory-grid">
          {visibleFactories.map((factory) => <button className="factory-card" key={factory.id} onClick={() => onNavigate(factory.id)}>
            <div className="factory-card-top"><span className={`factory-symbol ${factory.color}`}>{factory.id}</span><span className="card-arrow"><ArrowUpRight size={16} /></span></div>
            <div className="overline">{factory.eyebrow}</div><h3>{factory.name}</h3><p>{factory.description}</p>
            <div className="factory-progress-row"><span>{factory.progress}% complete</span><StatusBadge status={factory.status} /></div>
            <div className="progress-track"><span className={factory.color} style={{ width: `${factory.progress}%` }} /></div>
            <div className="factory-card-footer"><span>{factory.owner}</span><span>Updated today</span></div>
          </button>)}
        </div>
      </section>
      <section className="overview-lower-grid">
        <WorkflowMap onNavigate={onNavigate} />
        <ActivityFeed />
      </section>
      <section className="attention-banner">
        <span className="attention-icon"><TriangleAlert size={18} /></span>
        <div className="attention-copy"><b>3 requirements need attention</b><span>Quality systems, supply continuity, and regulatory ownership are still open.</span></div>
        <button className="button button-outline" onClick={() => onNavigate("F11")}>Review sourcing gaps <ArrowRight size={15} /></button>
      </section>
      <div className="fixture-note"><CircleHelp size={14} /> All metrics and records shown are illustrative DEMO / FIXTURE data. No factory has been qualified.</div>
    </div>
  )
}

function Metric({ label, value, suffix, change, icon, trend, footer }: { label: string; value: string; suffix: string; change: string; icon: React.ReactNode; trend: "up" | "neutral" | "warn"; footer: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}<small>{suffix}</small></div><div className="metric-change"><span className={`change-pill ${trend}`}>{trend === "warn" ? <TriangleAlert size={12} /> : trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}</span><span className="metric-footnote">{footer}</span></div></article>
}

function WorkflowMap({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const node = (id: FactoryId, title: string, subtitle: string, className: string) => <button className={`flow-node ${className}`} onClick={() => onNavigate(id)}><span className="flow-node-top"><b>{id}</b><span className="flow-dot" /></span><strong>{title}</strong><small>{subtitle}</small></button>
  return <article className="panel workflow-panel"><div className="panel-heading"><div><div className="overline">HOW THE SYSTEM CONNECTS</div><h2>Readiness workflow</h2></div><span className="mini-label">4 FACTORIES</span></div>
    <div className="workflow-canvas" aria-label="Workflow map: F1 and F6 feed founder readiness F12. Sourcing gaps go to F11, which uses F1 qualification.">
      <div className="workflow-left">{node("F1", "Qualification", "Provider capabilities", "node-f1")}{node("F6", "Evidence", "Validated records", "node-f6")}</div>
      <div className="flow-connectors"><span className="connector-line connector-one"/><span className="connector-line connector-two"/><span className="connector-tag">informs</span><span className="connector-tag secondary">evidence</span><span className="connector-line connector-three"/><span className="connector-tag third">gaps to resolve</span></div>
      <div className="workflow-right">{node("F12", "Founder readiness", "Unified readiness view", "node-f12")}{node("F11", "Sourcing", "Close identified gaps", "node-f11")}</div>
      <div className="workflow-caption"><span className="legend-line" /> Information flow <span className="legend-dot" /> Interactive factory nodes</div>
    </div>
  </article>
}

function ActivityFeed() {
  return <article className="panel activity-panel"><div className="panel-heading"><div><div className="overline">LATEST UPDATES</div><h2>Recent activity</h2></div><button className="icon-button" aria-label="Activity information"><Clock3 size={16} /></button></div>
    <div className="activity-list">{activityItems.map((item) => <div className="activity-item" key={item.title}><span className={`activity-avatar ${item.color}`}>{item.initials}</span><div className="activity-content"><b>{item.title}</b><span>{item.detail}</span><small>{item.time}</small></div></div>)}</div>
    <button className="activity-all">View activity log <ArrowRight size={14} /></button>
  </article>
}
