import { ArrowRight, CircleHelp } from "lucide-react"
import { demoScenario, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { HumanDispositionSelector } from "./scenario-components"
import { DataSourceBadge, ScenarioMetric, SectionHeader } from "./shared"

export function HumanDecisionPage({ disposition, onDispositionChange, onNavigate }: { disposition: HumanDisposition | null; onDispositionChange: (value: HumanDisposition | null) => void; onNavigate: (id: ViewId) => void }) {
  const gap = demoScenario.observedMinutes - demoScenario.targetMinutes

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="TECHNICAL CAPSTONE · ORIGINAL TEST FIXTURE · HUMAN REVIEW" title="Review the case-handling finding" description="A person reviews the simulated case-handling fixture before the technical demo continues to the people assessment." action={<button className="button button-outline" onClick={() => onNavigate("demo")}>Return to technical demo <ArrowRight size={15} /></button>} />
      <section className="panel panel-pad finding-panel"><div className="panel-heading"><div><div className="overline">ORIGINAL TEST FIXTURE · SIMULATED</div><h2>Observed result is above target</h2></div><DataSourceBadge source="SIMULATED" /></div><div className="metric-grid decision-metrics"><ScenarioMetric label="Target" value={demoScenario.targetMinutes} unit="min / case" detail="Technical fixture target" /><ScenarioMetric label="Observed" value={demoScenario.observedMinutes} unit="min / case" detail="Simulated performance result" /><ScenarioMetric label="Gap" value={`+${gap}`} unit="min / case" detail="Human review required in storyline" /></div></section>
      <section className="panel panel-pad decision-panel"><div className="panel-heading"><div><div className="overline">HUMAN REVIEW DECISION</div><h2>Choose how the scenario should proceed</h2></div><span className="scenario-icon"><CircleHelp size={18} /></span></div><p className="panel-intro">Your choice stays in this browser session and is sent with the third step when you run it. The backend may still return a scenario-defined disposition; this input does not guarantee that its authoritative result changes.</p><HumanDispositionSelector disposition={disposition} onChange={onDispositionChange} /><div className="decision-footer"><DataSourceBadge source="SIMULATED" /><span>{disposition ? "Local demo choice selected; not submitted to a service." : "No choice selected."}</span><button className="button button-dark" onClick={() => onNavigate("F1")} disabled={!disposition}>Continue to workforce review <ArrowRight size={14} /></button></div></section>
      <div className="scenario-caution"><CircleHelp size={15} /><span>This is a human decision point in the demo flow. Choosing an option does not approve a hire, assignment, or execution.</span></div>
    </div>
  )
}
