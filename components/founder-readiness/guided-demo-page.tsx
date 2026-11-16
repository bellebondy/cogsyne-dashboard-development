import { ArrowRight, CheckCircle2, CircleHelp, Play, RotateCcw } from "lucide-react"
import { scenarioSteps, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { ApiResponseDetails, FactoryHealthPanel, StepScenarioSummary } from "./scenario-components"
import { DataSourceBadge, SectionHeader } from "./shared"

export function GuidedDemoPage({ currentStep, completedSteps, disposition, onDispositionChange, onNavigate, onSelectStep, onRunNext, onRunAll, onReset, runMessage, searchTerm }: {
  currentStep: number
  completedSteps: number[]
  disposition: HumanDisposition | null
  onDispositionChange: (value: HumanDisposition | null) => void
  onNavigate: (id: ViewId) => void
  onSelectStep: (step: number) => void
  onRunNext: () => void
  onRunAll: () => void
  onReset: () => void
  runMessage: string
  searchTerm: string
}) {
  const active = scenarioSteps[currentStep]
  const visibleSteps = scenarioSteps.map((step, index) => ({ step, index })).filter(({ step }) => `${step.title} ${step.subtitle} ${step.description}`.toLowerCase().includes(searchTerm.toLowerCase()))
  const completedCount = completedSteps.length

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="GUIDED DEMO · FIVE STEPS" title="A performance gap leads to a talent decision." description="Run the official F4 → F6 → Human Decision → F1 → F11 storyline using clearly labeled local scenario fixtures." />
      <section className="guided-demo-hero"><div className="guided-demo-copy"><DataSourceBadge source="SIMULATED" /><h2>Preview the dependency flow without calling factory services.</h2><p>Factory services do not call one another. A separate demo server can orchestrate calls when connected; this preview is client-side only.</p></div><div className="guided-controls"><button className="button button-dark" onClick={onRunNext}><Play size={14} /> Run Next Step</button><button className="button button-outline" onClick={onRunAll}><CheckCircle2 size={14} /> Run All</button><button className="button button-quiet" onClick={onReset}><RotateCcw size={14} /> Reset</button></div></section>
      <div className="run-progress" role="progressbar" aria-label="Guided demo progress" aria-valuemin={0} aria-valuemax={scenarioSteps.length} aria-valuenow={completedCount}><span style={{ width: `${(completedCount / scenarioSteps.length) * 100}%` }} /></div>
      <p className="demo-run-message" role="status">{runMessage}</p>
      <div className="guided-layout">
        <section className="panel guided-step-list" aria-label="Five demo steps">
          <div className="panel-heading"><div><div className="overline">OFFICIAL STORYLINE</div><h2>Demo steps</h2></div><span className="mini-label">{completedCount}/{scenarioSteps.length} COMPLETE</span></div>
          <div className="guided-step-items">
            {visibleSteps.map(({ step, index }) => {
              const completed = completedSteps.includes(index)
              const focused = currentStep === index
              return <button key={step.id} className={`guided-step ${focused ? "current" : ""} ${completed ? "completed" : ""}`} onClick={() => onSelectStep(index)} aria-current={focused ? "step" : undefined}>
                <span className="guided-step-number">{completed ? <CheckCircle2 size={16} /> : `0${index + 1}`}</span>
                <span className="guided-step-copy"><strong>{step.title}</strong><small>{step.subtitle}</small></span>
                <span className="guided-step-status">{completed ? "SIMULATED · COMPLETE" : focused ? "CURRENT" : "NOT RUN"}</span>
              </button>
            })}
            {visibleSteps.length === 0 && <div className="empty-search">No demo steps match “{searchTerm}”.</div>}
          </div>
        </section>
        <section className="panel guided-detail" aria-live="polite">
          <div className="panel-heading"><div><div className="overline">STEP {String(currentStep + 1).padStart(2, "0")} OF 05</div><h2>{active.title}</h2></div><DataSourceBadge source="SIMULATED" /></div>
          <p className="panel-intro">{active.description}</p>
          <StepScenarioSummary stepId={active.id} disposition={disposition} onDispositionChange={onDispositionChange} />
          {active.view !== "demo" && <button className="text-button guided-detail-link" onClick={() => onNavigate(active.view)}>Open {active.title} detail <ArrowRight size={14} /></button>}
          <ApiResponseDetails stepId={active.id} />
        </section>
      </div>
      <FactoryHealthPanel />
      <div className="scenario-caution"><CircleHelp size={15} /><span>LIVE service health is not checked in this preview. Template data flags do not change source classification: LIVE requires an actual response from a running factory service.</span></div>
    </div>
  )
}
