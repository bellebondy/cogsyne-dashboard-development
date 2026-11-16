import { CircleCheck, CircleDot, CircleHelp, CircleX, Minus, RefreshCw } from "lucide-react"
import { demoScenario, factories, humanDispositions, scenarioSteps, type DemoStepId, type HumanDisposition } from "@/lib/founder-demo-data"
import { factoryPorts, getApiError, getFactoryHealth, getResponseValue, type ApiRequestResult, type StepExecutionResult } from "@/lib/demo-api"
import { DataSourceBadge } from "./shared"

export function HumanDispositionSelector({ disposition, onChange }: { disposition: HumanDisposition | null; onChange: (value: HumanDisposition | null) => void }) {
  return (
    <div className="decision-options" role="group" aria-label="Choose the human disposition to send with workflow step 3">
      {humanDispositions.map((option) => <button key={option.value} className={`decision-option ${disposition === option.value ? "selected" : ""}`} aria-pressed={disposition === option.value} onClick={() => onChange(disposition === option.value ? null : option.value)}>
        <span className="decision-option-indicator">{disposition === option.value ? <CircleDot size={17} /> : <span />}</span>
        <span><strong>{option.label}</strong><small>{option.description}</small></span>
      </button>)}
    </div>
  )
}

export function StepScenarioSummary({ stepId, disposition, onDispositionChange, result }: { stepId: DemoStepId; disposition: HumanDisposition | null; onDispositionChange: (value: HumanDisposition | null) => void; result?: StepExecutionResult }) {
  const decisionOutcome = getOutcomeValue(result?.payload, ["humanDecision", "human_decision", "decision", "disposition"])
  const recommendationOutcome = getOutcomeValue(result?.payload, ["recommendation", "talentRecommendation", "talent_recommendation"])
  const decisionValue = decisionOutcome ?? getResponseValue(result?.payload, ["summary"])
  const recommendationValue = recommendationOutcome ?? getResponseValue(result?.payload, ["summary"])
  if (stepId === "F4") return <div className="step-summary-grid"><ScenarioFact label="Initiative objective" value={demoScenario.objective} /><ScenarioFact label="Baseline" value={`${demoScenario.baselineMinutes} minutes per case`} /><ScenarioFact label="Target" value={`${demoScenario.targetMinutes} minutes per case`} /></div>
  if (stepId === "F6") return <div className="step-summary-grid"><ScenarioFact label="Observed result" value={`${demoScenario.observedMinutes} minutes per case`} /><ScenarioFact label="Target" value={`${demoScenario.targetMinutes} minutes per case`} /><ScenarioFact label="Performance gap" value={`+${demoScenario.observedMinutes - demoScenario.targetMinutes} minute per case`} emphasis /></div>
  if (stepId === "decision") return <div className="step-human-decision"><p className="step-guidance">Choose a human disposition. It is included in the step 3 request only when you run the workflow.</p><HumanDispositionSelector disposition={disposition} onChange={onDispositionChange} />{result?.request.upstreamResponded && decisionValue !== undefined && <BackendOutcome label={decisionOutcome === undefined ? "Human decision · backend summary" : "Human decision · backend response"} value={decisionValue} />}</div>
  if (stepId === "F1") return <div className="step-summary-grid"><ScenarioFact label="Simulated qualification claim" value={demoScenario.qualificationClaim} /><ScenarioFact label="Factory assessment" value={demoScenario.assessment} emphasis /><ScenarioFact label="Human disposition" value={disposition ? disposition.replaceAll("-", " ") : "Not selected"} /></div>
  return <div className="step-summary-grid">{result?.request.upstreamResponded && recommendationValue !== undefined && <BackendOutcome label={recommendationOutcome === undefined ? "F11 backend summary" : "F11 recommendation · backend response"} value={recommendationValue} />}<ScenarioFact label="Recommendation" value={demoScenario.recommendation} emphasis /><ScenarioFact label="Expected execution outcome" value="HTTP 403 expected denial · not observed" /><ScenarioFact label="Recognition record" value={`${demoScenario.recognitionRecord.reference} · ${demoScenario.recognitionRecord.status} · NOT a hire or assignment`} /></div>
}

function getOutcomeValue(payload: unknown, keys: string[]) {
  const directValue = getResponseValue(payload, keys)
  if (directValue !== undefined) return directValue
  return getResponseValue(getResponseValue(payload, ["liveData", "live_data"]), keys)
}

function BackendOutcome({ label, value }: { label: string; value: unknown }) {
  return <div className="backend-outcome"><div className="scenario-fact-label">{label}<DataSourceBadge source="LIVE" /></div><p>{formatValue(value)}</p></div>
}

function ScenarioFact({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return <div className={`scenario-fact ${emphasis ? "emphasis" : ""}`}><div className="scenario-fact-label">{label}<DataSourceBadge source="SIMULATED" /></div><p>{value}</p></div>
}

function formatValue(value: unknown) {
  if (typeof value === "string") return value
  if (value === undefined) return "Not provided by this response."
  try { return JSON.stringify(value, null, 2) } catch { return String(value) }
}

function RequestStatus({ request }: { request: ApiRequestResult }) {
  return <div className={`api-request-status ${request.ok && request.upstreamResponded ? "success" : "error"}`}><code>{request.method} {request.path}</code><strong>{request.httpStatus === null ? "No HTTP status" : `HTTP ${request.httpStatus}`}</strong><span>{request.durationMs} ms</span></div>
}

export function ApiResponseDetails({ stepId, result }: { stepId: DemoStepId; result?: StepExecutionResult }) {
  const step = scenarioSteps.find((item) => item.id === stepId)
  const isTalentStep = stepId === "F11"
  const payload = result?.payload
  const summary = getResponseValue(payload, ["summary"])
  const liveData = getResponseValue(payload, ["liveData", "live_data"])
  const simulatedData = getResponseValue(payload, ["simulatedData", "simulated_data"])
  const apiTrace = getResponseValue(payload, ["apiTrace", "api_trace", "trace"])
  const backendStatus = result?.backendStatus

  return (
    <details className="api-details">
      <summary><span>API response details</span><span className="api-details-hint">{result ? `${result.request.httpStatus ? `HTTP ${result.request.httpStatus}` : "No HTTP response"} · expand` : "Expand · no request yet"}</span><CircleHelp size={14} /></summary>
      <div className="api-details-grid">
        <section className="api-source-card live-response-card"><div className="panel-heading"><h3>Backend response</h3>{result?.request.upstreamResponded && <DataSourceBadge source="LIVE" />}</div>
          {!result ? <p>No request has been made for this step.</p> : <>
            <RequestStatus request={result.request} />
            {!result.request.upstreamResponded && <p className="api-error-message">{result.request.error ?? getApiError(result.request.payload) ?? "No response was received from the Factory API."}</p>}
            {result.request.upstreamResponded && <>
              <div className="api-response-field"><strong>Step status</strong><span>{backendStatus}</span></div>
              {summary !== undefined && <div className="api-response-field"><strong>Summary</strong><p>{formatValue(summary)}</p></div>}
              <div className="api-response-field"><strong>LIVE factory data</strong>{liveData === undefined ? <p>No separate liveData field was returned. The backend response is shown below.</p> : <pre>{formatValue(liveData)}</pre>}</div>
              {apiTrace !== undefined && <div className="api-response-field"><strong>API trace</strong><pre>{formatValue(apiTrace)}</pre></div>}
            </>}
            {result.request.payload !== null && <details className="api-json-details"><summary>{result.request.upstreamResponded ? "Full backend response" : "Proxy error response"}</summary><pre>{formatValue(result.request.payload)}</pre></details>}
          </>}
          <small>LIVE means the Next.js proxy received an HTTP response from the configured backend. A failed or blocked status is still reported as a failure.</small>
        </section>
        <section className="api-source-card simulated-response-card"><div className="panel-heading"><h3>SIMULATED scenario data</h3><DataSourceBadge source="SIMULATED" /></div>
          {simulatedData !== undefined ? <pre className="simulated-response-json">{formatValue(simulatedData)}</pre> : <p>No simulatedData field was returned by this step. The dashboard&apos;s local scenario fixtures below remain explicitly simulated.</p>}
          <dl className="scenario-definition-list"><dt>Workflow step</dt><dd>{step?.title}</dd><dt>Scenario fixture</dt><dd>Local dashboard values are not backend results.</dd>{isTalentStep && <><dt>F11 recommendation</dt><dd>{demoScenario.recommendation}</dd><dt>Expected denial</dt><dd>HTTP 403 is only expected by the local fixture; it is not an observed response.</dd></>}</dl>
          {isTalentStep && <strong className="recognition-guardrail">{demoScenario.recognitionRecord.guardrail}</strong>}
        </section>
      </div>
    </details>
  )
}

export function FactoryHealthPanel({ compact = false, healthRequest = null, healthPayload = null, configRequest = null, configPayload = null, onRefresh, refreshing = false, actionsDisabled = false }: {
  compact?: boolean
  healthRequest?: ApiRequestResult | null
  healthPayload?: unknown
  configRequest?: ApiRequestResult | null
  configPayload?: unknown
  onRefresh?: () => void
  refreshing?: boolean
  actionsDisabled?: boolean
}) {
  const hasHealthResponse = Boolean(healthRequest?.upstreamResponded && healthRequest.ok)
  return (
    <section className={`panel factory-health-panel ${compact ? "compact" : ""}`}>
      <div className="panel-heading"><div><div className="overline">LIVE FACTORY SERVICES</div><h2>Factory health indicators</h2></div><div className="health-panel-actions">{hasHealthResponse && <DataSourceBadge source="LIVE" />}{onRefresh && <button className="button button-quiet health-refresh" onClick={onRefresh} disabled={refreshing || actionsDisabled}><RefreshCw size={13} /> {refreshing ? "Checking…" : "Re-check services"}</button>}</div></div>
      <p className="panel-intro">{!healthRequest ? "Factory health has not been checked yet. Use Re-check services to request GET /api/health." : hasHealthResponse ? "Status below is parsed from the actual GET /api/health response." : healthRequest.error ?? "The health endpoint did not return a successful response."}</p>
      <div className="health-list">{factories.map((factory) => {
        const status = hasHealthResponse ? getFactoryHealth(healthPayload, factory.id) : "unknown"
        const unavailable = Boolean(healthRequest && !hasHealthResponse)
        const label = status === "online" ? "Online" : status === "offline" ? "Offline" : unavailable ? "Unavailable" : healthRequest ? "Not reported" : "Not checked"
        const Icon = status === "online" ? CircleCheck : status === "offline" ? CircleX : unavailable ? CircleHelp : Minus
        return <div className="health-row" key={factory.id}><span className={`health-unchecked health-icon-${status}`}><Icon size={13} /></span><span className="health-factory"><strong>{factory.id} · {factory.name}</strong><small>{factory.team} · port {factoryPorts[factory.id]}</small></span><span className={`health-status health-status-${status}`}>{label}</span></div>
      })}</div>
      {(healthRequest || configRequest) && <div className="health-api-summary">{healthRequest && <RequestStatus request={healthRequest} />}{configRequest && <details className="config-response-details"><summary>GET /api/config · {configRequest.httpStatus === null ? "No HTTP status" : `HTTP ${configRequest.httpStatus}`}</summary><div>{configRequest.upstreamResponded ? <DataSourceBadge source="LIVE" /> : <p className="api-error-message">{configRequest.error}</p>}<pre>{formatValue(configPayload)}</pre></div></details>}</div>}
      {!compact && <p className="health-footnote"><CircleHelp size={14} /> A service is marked LIVE only when health data comes from connected Factory Services. Configured ports: F4 · 3004, F6 · 3006, F1 · 3001, F11 · 3011.</p>}
    </section>
  )
}
