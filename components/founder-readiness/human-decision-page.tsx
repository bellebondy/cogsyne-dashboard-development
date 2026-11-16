import { ArrowRight, CircleHelp } from "lucide-react"
import { demoScenario, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { HumanDispositionSelector } from "./scenario-components"
import { DataSourceBadge, ScenarioMetric, SectionHeader } from "./shared"

export function HumanDecisionPage({ disposition, onDispositionChange, onNavigate }: { disposition: HumanDisposition | null; onDispositionChange: (value: HumanDisposition | null) => void; onNavigate: (id: ViewId) => void }) {
  const gap = demoScenario.observedMinutes - demoScenario.targetMinutes

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="HUMAN DECISION · BETWEEN F6 AND F1" title="Human Decision" description="A person reviews the F6 finding before the scenario proceeds to People Assurance." action={<button className="button button-outline" onClick={() => onNavigate("demo")}>Return to Guided Demo <ArrowRight size={15} /></button>} />
      <section className="panel panel-pad finding-panel"><div className="panel-heading"><div><div className="overline">F6 PERFORMANCE FINDING · SIMULATED</div><h2>Observed result is above target</h2></div><DataSourceBadge source="SIMULATED" /></div><div className="metric-grid decision-metrics"><ScenarioMetric label="Target" value={demoScenario.targetMinutes} unit="min / case" detail="F4 scenario target" /><ScenarioMetric label="Observed" value={demoScenario.observedMinutes} unit="min / case" detail="F6 scenario fixture" /><ScenarioMetric label="Gap" value={`+${gap}`} unit="min / case" detail="Human review required in storyline" /></div></section>
      <section className="panel panel-pad decision-panel"><div className="panel-heading"><div><div className="overline">HUMAN DISPOSITION</div><h2>Choose how the scenario should proceed</h2></div><span className="scenario-icon"><CircleHelp size={18} /></span></div><p className="panel-intro">Your choice is held only in this browser session. The actual disposition will eventually come from the factory API; no API is connected here.</p><HumanDispositionSelector disposition={disposition} onChange={onDispositionChange} /><div className="decision-footer"><DataSourceBadge source="SIMULATED" /><span>{disposition ? "Local demo disposition selected; not submitted to a service." : "No disposition selected."}</span><button className="button button-dark" onClick={() => onNavigate("F1")} disabled={!disposition}>Continue to F1 People Assurance <ArrowRight size={14} /></button></div></section>
      <div className="scenario-caution"><CircleHelp size={15} /><span>This is a human decision point in the demo flow. Choosing an option does not approve a hire, assignment, or execution.</span></div>
    </div>
  )
}
