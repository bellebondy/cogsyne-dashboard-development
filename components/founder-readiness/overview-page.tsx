import { ArrowRight, ArrowUpRight, CircleHelp, Folder, Gauge, GitBranch, Users } from "lucide-react"
import { demoScenario, factories, scenarioSteps, type ViewId } from "@/lib/founder-demo-data"
import { FactoryHealthPanel } from "./scenario-components"
import { DataSourceBadge } from "./shared"
import { PerformanceScenarioChart } from "./performance-scenario-chart"

export function OverviewPage({ onNavigate, onDemo, searchTerm }: { onNavigate: (id: ViewId) => void; onDemo: () => void; searchTerm: string }) {
  const visibleFactories = factories.filter((factory) => `${factory.id} ${factory.name} ${factory.team} ${factory.role} ${factory.description}`.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="page-stack">
      <div className="welcome-row">
        <div><div className="overline">ENTERPRISE OVERVIEW <span className="demo-chip">DEMO MODE</span></div><h1>Factory workflow overview<span className="title-dot">.</span></h1><p className="page-subtitle">Four factories, one human decision, and a clearly labeled scenario.</p></div>
        <button className="button button-dark" onClick={onDemo}><GitBranch size={16} /> Run guided demo</button>
      </div>
      <section className="metric-grid" aria-label="Scenario overview">
        <Metric label="Factory modules" value="4" icon={<Folder size={17} />} detail="F4 · F6 · F1 · F11" />
        <Metric label="Dependency steps" value="5" icon={<GitBranch size={17} />} detail="Includes a human decision" />
        <Metric label="Target" value={demoScenario.targetMinutes.toString()} suffix="min / case" icon={<Gauge size={17} />} detail="SIMULATED project target" />
        <Metric label="Observed fixture" value={demoScenario.observedMinutes.toString()} suffix="min / case" icon={<Users size={17} />} detail="SIMULATED performance result" />
      </section>
      <section className="section-block">
        <div className="section-heading"><div><div className="overline">FINAL FOUR FACTORIES</div><h2>Factory roles</h2></div><DataSourceBadge source="SIMULATED" /></div>
        <div className="factory-grid">
          {visibleFactories.map((factory) => <button className={`factory-card factory-${factory.color}`} key={factory.id} onClick={() => onNavigate(factory.id)} aria-label={`Open ${factory.id} ${factory.name}`}>
            <div className="factory-card-top"><span className={`factory-symbol ${factory.color}`}>{factory.id}</span><span className="card-arrow"><ArrowUpRight size={16} /></span></div>
            <div className="factory-card-meta"><span>{factory.team}</span><span className="factory-role-label">{factory.role}</span></div>
            <h3>{factory.name}</h3><p>{factory.description}</p>
            <div className="factory-card-footer"><span>Scenario fixture</span><span>Open details <ArrowRight size={12} /></span></div>
          </button>)}
          {visibleFactories.length === 0 && <div className="panel empty-search"><CircleHelp size={16} />No factories match “{searchTerm}”.</div>}
        </div>
      </section>
      <section className="section-block">
        <div className="section-heading"><div><div className="overline">OFFICIAL DEMONSTRATION STORYLINE</div><h2>A performance gap leads to a talent decision.</h2></div><button className="text-button" onClick={onDemo}>Open Guided Demo <ArrowRight size={15} /></button></div>
        <WorkflowPanel onNavigate={onNavigate} />
      </section>
      <section className="overview-lower-grid" aria-label="Scenario performance and live service availability">
        <PerformanceScenarioChart />
        <FactoryHealthPanel compact />
      </section>
      <div className="scenario-caution"><CircleHelp size={15} /><span>Factory services do not call one another. A separate demo server can orchestrate service calls when connected; this preview is client-side simulation only.</span></div>
    </div>
  )
}

function Metric({ label, value, suffix, icon, detail }: { label: string; value: string; suffix?: string; icon: React.ReactNode; detail: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}{suffix && <small>{suffix}</small>}</div><div className="metric-change"><DataSourceBadge source="SIMULATED" /><span className="metric-footnote">{detail}</span></div></article>
}

function WorkflowPanel({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  return (
    <article className="panel workflow-panel official-workflow">
      <div className="panel-heading"><div><div className="overline">DEPENDENCY FLOW</div><h2>F4 → F6 → Human Decision → F1 → F11</h2></div><span className="mini-label">5 STEPS</span></div>
      <div className="workflow-steps" aria-label="Official five-step workflow">
        {scenarioSteps.map((step, index) => <button className={`workflow-step workflow-${step.id.toLowerCase()}`} key={step.id} onClick={() => onNavigate(step.view)}>
          <span className="workflow-step-index">0{index + 1}</span>
          <span className="workflow-step-code">{step.id === "decision" ? "HUMAN" : step.id}</span>
          <strong>{step.title.replace(/^F\d+ /, "")}</strong>
          <small>{step.subtitle}</small>
        </button>)}
      </div>
      <div className="workflow-caption"><span className="legend-line" /> Dependency order <span className="workflow-caption-note">Select a step to open its detail view.</span></div>
    </article>
  )
}
