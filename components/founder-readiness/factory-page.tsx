import { useState, type FormEvent } from "react"
import { ArrowRight, CircleHelp, ShieldCheck, Sparkles } from "lucide-react"
import { demoScenario, getHumanDispositionLabel, type FactoryId, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"
import { PerformanceScenarioChart } from "./performance-scenario-chart"
import { DataSourceBadge, ScenarioMetric, SectionHeader } from "./shared"

export function FactoryPage({ factoryId, disposition, onNavigate }: { factoryId: FactoryId; disposition: HumanDisposition | null; onNavigate: (id: ViewId) => void }) {
  const { selectedDraft, isExampleMode, isCapstoneMode } = useInitiativeWorkspace()
  if (isCapstoneMode) {
    if (factoryId === "F4") return <ProjectPage onNavigate={onNavigate} />
    if (factoryId === "F6") return <PerformancePage onNavigate={onNavigate} />
    if (factoryId === "F1") return <PeopleAssurancePage disposition={disposition} onNavigate={onNavigate} />
    return <TalentPage disposition={disposition} onNavigate={onNavigate} />
  }
  if (isExampleMode) return <RestaurantPlanningPage factoryId={factoryId} onNavigate={onNavigate} />
  if (factoryId === "F6") return selectedDraft ? <DraftPerformancePage key={selectedDraft.id} /> : <NoSelectedInitiative section="Performance & Outcomes" onNavigate={onNavigate} />
  if (factoryId === "F1") return selectedDraft ? <PeoplePlanningPage key={selectedDraft.id} /> : <NoSelectedInitiative section="People & Resources" onNavigate={onNavigate} />
  return <NoSelectedInitiative section="Talent & Resources" onNavigate={onNavigate} />
}

function NoSelectedInitiative({ section, onNavigate }: { section: string; onNavigate: (id: ViewId) => void }) {
  return <div className="page-stack"><div className="business-page-heading"><div><div className="overline">{section.toUpperCase()}</div><h1>Choose an initiative to continue.</h1><p className="page-subtitle">This workspace keeps information connected to the initiative you select. No example results are shown as your own business data.</p></div></div><section className="panel initiative-empty"><span className="initiative-path-icon"><CircleHelp size={18} aria-hidden="true" /></span><div><h3>No initiative selected</h3><p>Start a local planning draft or explore the fictional restaurant scenario to see planning questions without assessment results.</p></div><button className="button button-dark" onClick={() => onNavigate("F4")}>View initiatives <ArrowRight size={14} aria-hidden="true" /></button></section></div>
}

function RestaurantPlanningPage({ factoryId, onNavigate }: { factoryId: FactoryId; onNavigate: (id: ViewId) => void }) {
  const area = factoryId === "F6" ? {
    title: "What outcomes might matter?",
    description: "No restaurant outcomes have been measured. A future review could agree how to compare these signals with a baseline.",
    questions: ["Average customer wait time", "Ingredient waste", "Forecast accuracy", "Staffing efficiency", "Customer satisfaction"],
  } : factoryId === "F1" ? {
    title: "Who would use or oversee forecasts?",
    description: "Consider how employees could understand the recommendations, spot issues, and keep people involved in decisions.",
    questions: ["Which roles need training?", "Who reviews or overrides a recommendation?", "What guidance supports safe use?"],
  } : {
    title: "What expertise might be needed?",
    description: "A planning conversation could identify existing skills, training needs, and any specialist support to investigate.",
    questions: ["Restaurant operations and workforce planning", "Data and forecasting expertise", "Security, privacy, and vendor review"],
  }
  return <div className="page-stack">
    <SectionHeader eyebrow="THE CHEESECAKE FACTORY · ILLUSTRATIVE DEMO" title={area.title} description={area.description} action={<button className="button button-outline" onClick={() => onNavigate("example")}>Open guided walkthrough <ArrowRight size={14} aria-hidden="true" /></button>} />
    <section className="panel restaurant-planning-panel"><div className="panel-heading"><div><div className="overline">QUESTIONS TO EXPLORE</div><h2>{factoryId === "F6" ? "Potential success measures" : factoryId === "F1" ? "People & skills" : "Talent & expertise"}</h2></div><span className="local-data-badge">NO ASSESSMENT RESULTS</span></div><ul>{area.questions.map((question) => <li key={question}>{question}</li>)}</ul><p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />Fictional educational example only. These questions are illustrative—not factory responses, ratings, certifications, or approved decisions. No actual company data or outcomes are shown.</p></section>
  </div>
}

function ProjectPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="TECHNICAL CAPSTONE · ORIGINAL TEST FIXTURE" title="Case handling time reduction" description="This fixed technical test fixture is separate from the restaurant illustration and demonstrates the existing API workflow." action={<button className="button button-dark" onClick={() => onNavigate("capstone-F6")}>Review performance <ArrowRight size={15} /></button>} />
      <section className="scenario-hero project-hero"><div><span className="overline">SIMULATED INITIATIVE</span><h2>Business objective</h2><p>{demoScenario.objective}</p></div><DataSourceBadge source="SIMULATED" /></section>
      <section className="metric-grid" aria-label="Project scenario measures">
        <ScenarioMetric label="Baseline" value={demoScenario.baselineMinutes} unit="min / case" detail="Starting point in the scenario fixture" />
        <ScenarioMetric label="Target" value={demoScenario.targetMinutes} unit="min / case" detail="Project goal; not a live service metric" />
      </section>
      <section className="panel panel-pad scenario-panel"><div className="panel-heading"><div><div className="overline">PROJECT OBJECTIVE</div><h2>Define the measure, not a live result</h2></div><span className="scenario-icon"><Sparkles size={18} /></span></div><p className="panel-intro">The next step compares an explicitly simulated observation against this target. No initiative has been submitted to a factory service.</p><div className="scenario-inline-note"><span>INITIATIVE</span><b>10 minutes baseline</b><ArrowRight size={14} /><b>8 minutes target</b></div></section>
    </div>
  )
}

function PerformancePage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const gap = demoScenario.observedMinutes - demoScenario.targetMinutes
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="TECHNICAL CAPSTONE · ORIGINAL TEST FIXTURE" title="Performance review" description="Compare the scenario observation against the initiative target. These values are simulated, not live telemetry." action={<button className="button button-dark" onClick={() => onNavigate("capstone-decision")}>Review finding <ArrowRight size={15} /></button>} />
      <section className="metric-grid" aria-label="Simulated performance measures">
        <ScenarioMetric label="Baseline" value={demoScenario.baselineMinutes} unit="min / case" detail="Initiative scenario target" />
        <ScenarioMetric label="Target" value={demoScenario.targetMinutes} unit="min / case" detail="Initiative scenario target" />
        <ScenarioMetric label="Observed result" value={demoScenario.observedMinutes} unit="min / case" detail="SIMULATED observation" />
        <ScenarioMetric label="Performance gap" value={`+${gap}`} unit="min / case" detail="Above target in this scenario" />
      </section>
      <PerformanceScenarioChart />
      <div className="scenario-caution"><CircleHelp size={15} /><span>The 9-minute result and 1-minute gap are scenario calculations only. No factory response, measurement, or successful HTTP status is represented.</span></div>
    </div>
  )
}

function DraftPerformancePage() {
  const { selectedDraft, updateDraft } = useInitiativeWorkspace()
  const [metric, setMetric] = useState(() => ({
    successMetric: selectedDraft?.successMetric ?? "",
    baseline: selectedDraft?.baseline ?? "",
    target: selectedDraft?.target ?? "",
    unit: selectedDraft?.unit ?? "",
    measurementPeriod: selectedDraft?.measurementPeriod ?? "",
  }))
  const [saved, setSaved] = useState(false)
  if (!selectedDraft) return null
  const setField = (field: keyof typeof metric, value: string) => { setMetric((current) => ({ ...current, [field]: value })); setSaved(false) }
  const saveMetric = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateDraft({ ...selectedDraft, ...metric })
    setSaved(true)
  }

  return <div className="page-stack">
    <div className="business-page-heading"><div><div className="overline">PERFORMANCE &amp; BUSINESS VALUE · LOCAL PLANNING</div><h1>Define how success could be measured.</h1><p className="page-subtitle">These are user-entered planning targets—not verified results or a validated forecast.</p></div><span className="local-data-badge">LOCAL DRAFT</span></div>
    <section className="panel initiative-detail-panel"><div className="panel-heading"><div><div className="overline">{selectedDraft.name}</div><h2>Proposed success measure</h2></div></div><form className="initiative-form-grid" onSubmit={saveMetric}><label className="initiative-field"><span>Success metric</span><input value={metric.successMetric} onChange={(event) => setField("successMetric", event.target.value)} placeholder="e.g. Resolution time" /></label><label className="initiative-field"><span>Measurement period</span><input value={metric.measurementPeriod} onChange={(event) => setField("measurementPeriod", event.target.value)} placeholder="e.g. Monthly" /></label><label className="initiative-field"><span>Baseline, if known</span><input value={metric.baseline} onChange={(event) => setField("baseline", event.target.value)} placeholder="e.g. 12" /></label><label className="initiative-field"><span>Intended target</span><input value={metric.target} onChange={(event) => setField("target", event.target.value)} placeholder="e.g. 8" /></label><label className="initiative-field"><span>Measurement unit</span><input value={metric.unit} onChange={(event) => setField("unit", event.target.value)} placeholder="e.g. minutes per case" /></label><div className="initiative-form-actions review-wide"><button className="button button-dark" type="submit">Save planning measure <ArrowRight size={14} aria-hidden="true" /></button>{saved && <span role="status" className="local-save-status">Saved in this browser only.</span>}</div></form></section>
    <section className="panel initiative-detail-panel performance-evidence"><div className="panel-heading"><div><div className="overline">RESULTS &amp; MEASUREMENT</div><h2>No observed result is available</h2></div><span className="local-data-badge">NOT MEASURED</span></div><p className="panel-intro">A baseline or target alone does not show that the initiative is working. To evaluate outcomes later, identify a trustworthy measurement source, comparable time periods, and an accountable reviewer.</p><div className="initiative-review-grid"><div><span>User-entered baseline</span><strong>{metric.baseline ? `${metric.baseline} ${metric.unit}` : "Not provided"}</strong></div><div><span>User-entered target</span><strong>{metric.target ? `${metric.target} ${metric.unit}` : "Not provided"}</strong></div><div><span>Metric</span><strong>{metric.successMetric || "Not defined"}</strong></div><div><span>Review period</span><strong>{metric.measurementPeriod || "Not defined"}</strong></div></div><p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />No performance result, progress percentage, or readiness score is generated for local drafts.</p></section>
  </div>
}

function PeoplePlanningPage() {
  const { selectedDraft, updateDraft } = useInitiativeWorkspace()
  const [skills, setSkills] = useState(selectedDraft?.peopleSkills ?? "")
  const [resources, setResources] = useState(selectedDraft?.resourceNeeds ?? "")
  const [saved, setSaved] = useState(false)
  if (!selectedDraft) return null
  const savePlanning = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateDraft({ ...selectedDraft, peopleSkills: skills, resourceNeeds: resources, checklist: { ...selectedDraft.checklist, people: true } })
    setSaved(true)
  }

  return <div className="page-stack">
    <div className="business-page-heading"><div><div className="overline">PEOPLE &amp; RESOURCES · LOCAL PLANNING</div><h1>Plan the capabilities this initiative may need.</h1><p className="page-subtitle">Explore skill and resource questions without making claims about real employees or verified qualifications.</p></div><span className="local-data-badge">LOCAL DRAFT</span></div>
    <section className="panel initiative-detail-panel"><div className="panel-heading"><div><div className="overline">{selectedDraft.name}</div><h2>Skills and resource planning</h2></div></div><form className="initiative-notes-form" onSubmit={savePlanning}><label className="initiative-field"><span>Skills or capabilities to assess</span><textarea rows={3} value={skills} onChange={(event) => { setSkills(event.target.value); setSaved(false) }} placeholder="Describe roles or capabilities in general terms. Do not include employee names or personal information." /></label><label className="initiative-field"><span>Training, expertise, or other resource needs</span><textarea rows={3} value={resources} onChange={(event) => { setResources(event.target.value); setSaved(false) }} placeholder="What training, specialist support, or capacity might be needed?" /></label><button className="button button-dark" type="submit">Save local people plan <ArrowRight size={14} aria-hidden="true" /></button>{saved && <span role="status" className="local-save-status">Saved in this browser only. No qualifications were verified.</span>}</form></section>
    <section className="panel initiative-detail-panel"><div className="overline">QUESTIONS FOR A FUTURE REVIEW</div><ul className="people-review-list"><li>What roles will work with or oversee the AI-enabled process?</li><li>What evidence would support the capability claims being considered?</li><li>Where might additional training, capacity, or specialist expertise be needed?</li><li>Who should review a talent recommendation before any action is considered?</li></ul><p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />This planning checklist is not a workforce assessment and does not verify individual qualifications.</p></section>
  </div>
}

function PeopleAssurancePage({ disposition, onNavigate }: { disposition: HumanDisposition | null; onNavigate: (id: ViewId) => void }) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="PEOPLE & RESOURCES · DEMO SCENARIO" title="Workforce capability review" description="Review the scenario&apos;s qualification claim and see how talent recommendations are handled." action={<button className="button button-dark" onClick={() => onNavigate("capstone-F11")}>View talent recommendation <ArrowRight size={15} /></button>} />
      <div className="scenario-two-column">
        <section className="panel panel-pad claim-panel"><div className="panel-heading"><div><div className="overline">SIMULATED QUALIFICATION CLAIM</div><h2>Claim under assessment</h2></div><DataSourceBadge source="SIMULATED" /></div><blockquote>{demoScenario.qualificationClaim}</blockquote><p className="panel-intro">This claim is provided as a scenario fixture. It is not a real person or team qualification.</p></section>
        <section className="panel panel-pad assessment-panel"><div className="panel-heading"><div><div className="overline">SIMULATED WORKFORCE REVIEW</div><h2>Assessment outcome</h2></div><span className="scenario-icon"><ShieldCheck size={18} /></span></div><p>{demoScenario.assessment}</p><div className="assessment-disposition"><span>Human decision</span><b>{getHumanDispositionLabel(disposition)}</b><DataSourceBadge source="SIMULATED" /></div></section>
      </div>
      <div className="scenario-caution"><CircleHelp size={15} /><span>This assessment is a demo fixture, not an independent assurance decision, certification, or live service response.</span></div>
    </div>
  )
}

function TalentPage({ disposition, onNavigate }: { disposition: HumanDisposition | null; onNavigate: (id: ViewId) => void }) {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="PEOPLE & RESOURCES · DEMO SCENARIO" title="Talent & resource recommendations" description="Review the downstream recommendation while keeping any real-world execution explicitly outside this demo." action={<button className="button button-outline" onClick={() => onNavigate("demo")}>Open technical demo <ArrowRight size={15} /></button>} />
      <section className="panel panel-pad recommendation-panel"><div className="panel-heading"><div><div className="overline">SIMULATED TALENT RECOMMENDATION</div><h2>Recommendation for human review</h2></div><DataSourceBadge source="SIMULATED" /></div><p>{demoScenario.recommendation}</p><div className="assessment-disposition"><span>Human decision</span><b>{getHumanDispositionLabel(disposition)}</b></div></section>
      <section className="scenario-two-column">
        <article className="execution-denial-card"><div className="denial-card-heading"><div><span className="overline">EXECUTION SAFEGUARD</span><h2>A recommendation is not authorization</h2></div><span className="denial-status">NO EXECUTION REQUEST</span></div><p>No real hire or assignment is authorized from this business view. Any action requires human review and backend safeguards.</p><small>Technical HTTP results are shown in the Capstone Showcase only when confirmed by the backend trace.</small></article>
        <article className="panel panel-pad recognition-card"><div className="panel-heading"><div><div className="overline">SIMULATED RECOGNITION RECORD</div><h2>{demoScenario.recognitionRecord.type}</h2></div><span className="scenario-icon"><Sparkles size={18} /></span></div><dl className="scenario-definition-list"><dt>Reference</dt><dd>{demoScenario.recognitionRecord.reference}</dd><dt>Capability</dt><dd>{demoScenario.recognitionRecord.capability}</dd><dt>Record status</dt><dd>{demoScenario.recognitionRecord.status}</dd></dl><strong className="recognition-guardrail">{demoScenario.recognitionRecord.guardrail}</strong></article>
      </section>
      <div className="scenario-caution"><CircleHelp size={15} /><span>Recognition records recognition only. It is NOT a hire or assignment, and this preview performs no execution.</span></div>
    </div>
  )
}
