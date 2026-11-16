import { ArrowRight, CircleHelp, ShieldCheck, Sparkles } from "lucide-react"
import { demoScenario, type FactoryId, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { PerformanceScenarioChart } from "./performance-scenario-chart"
import { DataSourceBadge, ScenarioMetric, SectionHeader } from "./shared"

export function FactoryPage({ factoryId, disposition, onNavigate }: { factoryId: FactoryId; disposition: HumanDisposition | null; onNavigate: (id: ViewId) => void }) {
  if (factoryId === "F4") return <ProjectPage onNavigate={onNavigate} />
  if (factoryId === "F6") return <PerformancePage onNavigate={onNavigate} />
  if (factoryId === "F1") return <PeopleAssurancePage disposition={disposition} onNavigate={onNavigate} />
  return <TalentPage disposition={disposition} onNavigate={onNavigate} />
}

function ProjectPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="F4 · PROJECT · TEAM 2" title="Project" description="A simulated initiative sets the outcome and the measures used by the performance step." action={<button className="button button-dark" onClick={() => onNavigate("F6")}>Continue to F6 Performance <ArrowRight size={15} /></button>} />
      <section className="scenario-hero project-hero"><div><span className="overline">SIMULATED INITIATIVE</span><h2>Case handling time reduction</h2><p>{demoScenario.objective}</p></div><DataSourceBadge source="SIMULATED" /></section>
      <section className="metric-grid" aria-label="Project scenario measures">
        <ScenarioMetric label="Baseline" value={demoScenario.baselineMinutes} unit="min / case" detail="Starting point in the scenario fixture" />
        <ScenarioMetric label="Target" value={demoScenario.targetMinutes} unit="min / case" detail="Project goal; not a live service metric" />
      </section>
      <section className="panel panel-pad scenario-panel"><div className="panel-heading"><div><div className="overline">PROJECT OBJECTIVE</div><h2>Define the measure, not a live result</h2></div><span className="scenario-icon"><Sparkles size={18} /></span></div><p className="panel-intro">The next step compares an explicitly simulated observation against this target. No initiative has been submitted to a factory service.</p><div className="scenario-inline-note"><span>F4</span><b>10 minutes baseline</b><ArrowRight size={14} /><b>8 minutes target</b></div></section>
    </div>
  )
}

function PerformancePage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const gap = demoScenario.observedMinutes - demoScenario.targetMinutes
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="F6 · PERFORMANCE · TEAM 2" title="Performance" description="Compare the scenario observation against the F4 project target. This is not live telemetry." action={<button className="button button-dark" onClick={() => onNavigate("decision")}>Review human decision <ArrowRight size={15} /></button>} />
      <section className="metric-grid" aria-label="Simulated performance measures">
        <ScenarioMetric label="Baseline" value={demoScenario.baselineMinutes} unit="min / case" detail="F4 project fixture" />
        <ScenarioMetric label="Target" value={demoScenario.targetMinutes} unit="min / case" detail="F4 project fixture" />
        <ScenarioMetric label="Observed result" value={demoScenario.observedMinutes} unit="min / case" detail="SIMULATED observation" />
        <ScenarioMetric label="Performance gap" value={`+${gap}`} unit="min / case" detail="Above target in this scenario" />
      </section>
      <PerformanceScenarioChart />
      <div className="scenario-caution"><CircleHelp size={15} /><span>The 9-minute result and 1-minute gap are scenario calculations only. No factory response, measurement, or successful HTTP status is represented.</span></div>
    </div>
  )
}

function PeopleAssurancePage({ disposition, onNavigate }: { disposition: HumanDisposition | null; onNavigate: (id: ViewId) => void }) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="F1 · PEOPLE ASSURANCE · TEAM 1" title="People Assurance" description="Review a simulated qualification claim and a scenario-only factory assessment." action={<button className="button button-dark" onClick={() => onNavigate("F11")}>Continue to F11 Talent <ArrowRight size={15} /></button>} />
      <div className="scenario-two-column">
        <section className="panel panel-pad claim-panel"><div className="panel-heading"><div><div className="overline">SIMULATED QUALIFICATION CLAIM</div><h2>Claim under assessment</h2></div><DataSourceBadge source="SIMULATED" /></div><blockquote>{demoScenario.qualificationClaim}</blockquote><p className="panel-intro">This claim is provided as a scenario fixture. It is not a real person or team qualification.</p></section>
        <section className="panel panel-pad assessment-panel"><div className="panel-heading"><div><div className="overline">SIMULATED FACTORY ASSESSMENT</div><h2>Assessment outcome</h2></div><span className="scenario-icon"><ShieldCheck size={18} /></span></div><p>{demoScenario.assessment}</p><div className="assessment-disposition"><span>Human disposition</span><b>{disposition ? disposition.replaceAll("-", " ") : "Not selected"}</b><DataSourceBadge source="SIMULATED" /></div></section>
      </div>
      <div className="scenario-caution"><CircleHelp size={15} /><span>This assessment is a demo fixture, not an independent assurance decision, certification, or live F1 response.</span></div>
    </div>
  )
}

function TalentPage({ disposition, onNavigate }: { disposition: HumanDisposition | null; onNavigate: (id: ViewId) => void }) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="F11 · TALENT ASSURANCE & MARKETPLACE · TEAM 1" title="Talent Assurance & Marketplace" description="Show the downstream recommendation while keeping execution explicitly denied in the scenario." action={<button className="button button-outline" onClick={() => onNavigate("demo")}>Open Guided Demo <ArrowRight size={15} /></button>} />
      <section className="panel panel-pad recommendation-panel"><div className="panel-heading"><div><div className="overline">SIMULATED TALENT RECOMMENDATION</div><h2>Recommendation for human review</h2></div><DataSourceBadge source="SIMULATED" /></div><p>{demoScenario.recommendation}</p><div className="assessment-disposition"><span>Human disposition</span><b>{disposition ? disposition.replaceAll("-", " ") : "Not selected"}</b></div></section>
      <section className="scenario-two-column">
        <article className="execution-denial-card"><div className="denial-card-heading"><div><span className="overline">EXPECTED EXECUTION DENIAL</span><h2>HTTP 403 · expected, not observed</h2></div><span className="denial-status">SIMULATED EXPECTATION</span></div><p>{demoScenario.expectedExecutionDenial}</p><small>No execution request was made in preview.</small></article>
        <article className="panel panel-pad recognition-card"><div className="panel-heading"><div><div className="overline">SIMULATED RECOGNITION RECORD</div><h2>{demoScenario.recognitionRecord.type}</h2></div><span className="scenario-icon"><Sparkles size={18} /></span></div><dl className="scenario-definition-list"><dt>Reference</dt><dd>{demoScenario.recognitionRecord.reference}</dd><dt>Capability</dt><dd>{demoScenario.recognitionRecord.capability}</dd><dt>Record status</dt><dd>{demoScenario.recognitionRecord.status}</dd></dl><strong className="recognition-guardrail">{demoScenario.recognitionRecord.guardrail}</strong></article>
      </section>
      <div className="scenario-caution"><CircleHelp size={15} /><span>Recognition records recognition only. It is NOT a hire or assignment, and this preview performs no execution.</span></div>
    </div>
  )
}
