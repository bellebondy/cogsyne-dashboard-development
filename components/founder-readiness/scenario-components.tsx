import { ArrowRight, CircleHelp, CircleDot, Minus } from "lucide-react"
import { demoScenario, factories, humanDispositions, scenarioSteps, type DemoStepId, type HumanDisposition } from "@/lib/founder-demo-data"
import { DataSourceBadge } from "./shared"

export function HumanDispositionSelector({ disposition, onChange }: { disposition: HumanDisposition | null; onChange: (value: HumanDisposition | null) => void }) {
  return (
    <div className="decision-options" role="group" aria-label="Choose a simulated human disposition">
      {humanDispositions.map((option) => <button key={option.value} className={`decision-option ${disposition === option.value ? "selected" : ""}`} aria-pressed={disposition === option.value} onClick={() => onChange(disposition === option.value ? null : option.value)}>
        <span className="decision-option-indicator">{disposition === option.value ? <CircleDot size={17} /> : <span />}</span>
        <span><strong>{option.label}</strong><small>{option.description}</small></span>
      </button>)}
    </div>
  )
}

export function StepScenarioSummary({ stepId, disposition, onDispositionChange }: { stepId: DemoStepId; disposition: HumanDisposition | null; onDispositionChange: (value: HumanDisposition | null) => void }) {
  if (stepId === "F4") return <div className="step-summary-grid"><ScenarioFact label="Initiative objective" value={demoScenario.objective} /><ScenarioFact label="Baseline" value={`${demoScenario.baselineMinutes} minutes per case`} /><ScenarioFact label="Target" value={`${demoScenario.targetMinutes} minutes per case`} /></div>
  if (stepId === "F6") return <div className="step-summary-grid"><ScenarioFact label="Observed result" value={`${demoScenario.observedMinutes} minutes per case`} /><ScenarioFact label="Target" value={`${demoScenario.targetMinutes} minutes per case`} /><ScenarioFact label="Performance gap" value={`+${demoScenario.observedMinutes - demoScenario.targetMinutes} minute per case`} emphasis /></div>
  if (stepId === "decision") return <div className="step-human-decision"><p className="step-guidance">Select a disposition to continue. This local choice is not sent to a factory API.</p><HumanDispositionSelector disposition={disposition} onChange={onDispositionChange} /></div>
  if (stepId === "F1") return <div className="step-summary-grid"><ScenarioFact label="Simulated qualification claim" value={demoScenario.qualificationClaim} /><ScenarioFact label="Factory assessment" value={demoScenario.assessment} emphasis /><ScenarioFact label="Human disposition" value={disposition ? disposition.replaceAll("-", " ") : "Not selected"} /></div>
  return <div className="step-summary-grid"><ScenarioFact label="Recommendation" value={demoScenario.recommendation} emphasis /><ScenarioFact label="Expected execution outcome" value="HTTP 403 expected denial · not observed" /><ScenarioFact label="Recognition record" value={`${demoScenario.recognitionRecord.reference} · ${demoScenario.recognitionRecord.status} · NOT a hire or assignment`} /></div>
}

function ScenarioFact({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={`scenario-fact ${emphasis ? "emphasis" : ""}`}><div className="scenario-fact-label">{label}<DataSourceBadge source="SIMULATED" /></div><p>{value}</p></div>
}

export function ApiResponseDetails({ stepId }: { stepId: DemoStepId }) {
  const step = scenarioSteps.find((item) => item.id === stepId)
  const isTalentStep = stepId === "F11"

  return (
    <details className="api-details">
      <summary><span>API response details</span><span className="api-details-hint">Expand · no live response in preview</span><ArrowRight size={14} /></summary>
      <div className="api-details-grid">
        <section className="api-source-card live-response-card"><div className="panel-heading"><h3>Live service response</h3><DataSourceBadge source="LIVE" /></div><p>No live response is available. No endpoint is configured and no API request was made.</p><small>LIVE is reserved for an actual response from a running factory service.</small></section>
        <section className="api-source-card simulated-response-card"><div className="panel-heading"><h3>Scenario detail</h3><DataSourceBadge source="SIMULATED" /></div><dl className="scenario-definition-list"><dt>Step</dt><dd>{step?.title}</dd><dt>Service request</dt><dd>Not sent</dd>{isTalentStep ? <><dt>Expected execution denial</dt><dd>HTTP 403 expected only; not a returned status</dd></> : <><dt>Scenario source</dt><dd>Local fixture and demo calculation</dd></>}<dt>Factory chain</dt><dd>Orchestration belongs to a separate demo server; factories do not call each other.</dd></dl>{isTalentStep && <strong className="recognition-guardrail">{demoScenario.recognitionRecord.guardrail}</strong>}</section>
      </div>
    </details>
  )
}

export function FactoryHealthPanel({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`panel factory-health-panel ${compact ? "compact" : ""}`}>
      <div className="panel-heading"><div><div className="overline">LIVE FACTORY SERVICES</div><h2>Factory health indicators</h2></div><DataSourceBadge source="LIVE" /></div>
      <p className="panel-intro">Health checks are not configured in this preview. No service health is claimed and no health requests were made.</p>
      <div className="health-list">{factories.map((factory) => <div className="health-row" key={factory.id}><span className="health-unchecked"><Minus size={13} /></span><span className="health-factory"><strong>{factory.id} · {factory.name}</strong><small>{factory.team}</small></span><span className="health-status"><CircleHelp size={13} /> Not checked</span></div>)}</div>
      {!compact && <p className="health-footnote"><CircleHelp size={14} /> LIVE refers to responses and health from running factory services, regardless of a template data flag.</p>}
    </section>
  )
}
