import { ArrowRight, CheckCircle2, CircleHelp, Play, RotateCcw } from "lucide-react"
import { scenarioSteps, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import type { ApiRequestResult, StepExecutionResult } from "@/lib/demo-api"
import { ApiResponseDetails, FactoryHealthPanel, StepScenarioSummary } from "./scenario-components"
import { DataSourceBadge, SectionHeader } from "./shared"

export function GuidedDemoPage({ currentStep, completedSteps, disposition, onDispositionChange, onNavigate, onSelectStep, onRunNext, onRunStep, onRunAll, onReset, runMessage, searchTerm, stepResults, configRequest, healthRequest, configPayload, healthPayload, onRefreshServices, busy, refreshing, runningAll, runningStep }: {
  currentStep: number
  completedSteps: number[]
  disposition: HumanDisposition | null
  onDispositionChange: (value: HumanDisposition | null) => void
  onNavigate: (id: ViewId) => void
  onSelectStep: (step: number) => void
  onRunNext: () => void
  onRunStep: (step: number) => void
  onRunAll: () => void
  onReset: () => void
  runMessage: string
  searchTerm: string
  stepResults: Partial<Record<number, StepExecutionResult>>
  configRequest: ApiRequestResult | null
  healthRequest: ApiRequestResult | null
  configPayload: unknown
  healthPayload: unknown
  onRefreshServices: () => void
  busy: boolean
  refreshing: boolean
  runningAll: boolean
  runningStep: number | null
}) {
  const active = scenarioSteps[currentStep]
  const activeResult = stepResults[currentStep]
  const visibleSteps = scenarioSteps.map((step, index) => ({ step, index })).filter(({ step }) => `${step.title} ${step.subtitle} ${step.description}`.toLowerCase().includes(searchTerm.toLowerCase()))
  const completedCount = completedSteps.length

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="TECHNICAL CAPSTONE · ORIGINAL TEST FIXTURE · FIVE STEPS" title="A performance gap leads to a talent decision." description="Run F4 → F6 → Human Decision → F1 → F11 through the configured demo workflow when available. This fixed case-handling test fixture is separate from the restaurant illustration and does not assess restaurant demand forecasting." />
      <section className="guided-demo-hero"><div className="guided-demo-copy"><DataSourceBadge source="SIMULATED" /><h2>Run the existing Cogsyne AI workflow demonstration.</h2><p>Step requests are proxied server-side. Only actual backend responses are marked LIVE; any scenario data in a response stays labeled SIMULATED.</p></div><div className="guided-controls"><button className="button button-dark" onClick={onRunNext} disabled={busy} aria-busy={runningStep !== null}><Play size={14} /> {runningStep !== null ? "Running step…" : "Run Next Step"}</button><button className="button button-outline" onClick={onRunAll} disabled={busy} aria-busy={runningAll}><CheckCircle2 size={14} /> {runningAll ? "Running all…" : "Run All"}</button><button className="button button-quiet" onClick={onReset} disabled={busy}><RotateCcw size={14} /> Reset</button></div></section>
      <div className="run-progress" role="progressbar" aria-label="Guided demo progress" aria-valuemin={0} aria-valuemax={scenarioSteps.length} aria-valuenow={completedCount}><span style={{ width: `${(completedCount / scenarioSteps.length) * 100}%` }} /></div>
      <p className="demo-run-message" role="status">{runMessage}</p>
      <div className="guided-layout">
        <section className="panel guided-step-list" aria-label="Five demo steps">
          <div className="panel-heading"><div><div className="overline">ORIGINAL TECHNICAL TEST FIXTURE</div><h2>Demo steps</h2></div><span className="mini-label">{completedCount}/{scenarioSteps.length} COMPLETE</span></div>
          <div className="guided-step-items">
            {visibleSteps.map(({ step, index }) => {
              const result = stepResults[index]
              const completed = Boolean(result?.successful)
              const focused = currentStep === index
              const status = completed ? "LIVE · COMPLETE" : result ? `STOPPED · HTTP ${result.request.httpStatus ?? "—"}` : focused ? "CURRENT" : "NOT RUN"
              return <button key={step.id} className={`guided-step ${focused ? "current" : ""} ${completed ? "completed" : ""} ${result && !completed ? "failed" : ""}`} onClick={() => onSelectStep(index)} aria-current={focused ? "step" : undefined}>
                <span className="guided-step-number">{completed ? <CheckCircle2 size={16} /> : `0${index + 1}`}</span>
                <span className="guided-step-copy"><strong>{step.title}</strong><small>{step.subtitle}</small></span>
                <span className="guided-step-status">{status}</span>
              </button>
            })}
            {visibleSteps.length === 0 && <div className="empty-search">No demo steps match “{searchTerm}”.</div>}
          </div>
        </section>
        <section className="panel guided-detail" aria-live="polite">
          <div className="panel-heading"><div><div className="overline">STEP {String(currentStep + 1).padStart(2, "0")} OF 05</div><h2>{active.title}</h2></div><DataSourceBadge source={activeResult?.request.upstreamResponded ? "LIVE" : "SIMULATED"} /></div>
          <p className="panel-intro">{active.description}</p>
          <StepScenarioSummary stepId={active.id} disposition={disposition} onDispositionChange={onDispositionChange} result={activeResult} />
          <div className="guided-detail-actions">
            <button className="button button-dark" onClick={() => onRunStep(currentStep)} disabled={busy} aria-busy={runningStep === currentStep || runningAll}>
              <Play size={14} /> {runningStep === currentStep || runningAll ? "Running step…" : activeResult?.successful ? "Run this step again" : "Run this step"}
            </button>
            {active.view !== "demo" && <button className="text-button guided-detail-link" onClick={() => onNavigate(active.view)}>Open {active.title} detail <ArrowRight size={14} /></button>}
          </div>
          <ApiResponseDetails stepId={active.id} result={activeResult} />
        </section>
      </div>
      <FactoryHealthPanel healthRequest={healthRequest} healthPayload={healthPayload} configRequest={configRequest} configPayload={configPayload} onRefresh={onRefreshServices} refreshing={refreshing} actionsDisabled={busy} />
      <div className="scenario-caution"><CircleHelp size={15} /><span>Reset clears this browser&apos;s workflow state. The Factory API does not provide a remote reset endpoint, so no backend reset request is sent.</span></div>
    </div>
  )
}
