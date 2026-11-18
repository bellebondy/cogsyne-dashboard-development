import { ArrowRight, CircleHelp, Clock3, FileText } from "lucide-react"
import { demoScenario, getHumanDispositionLabel, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { getDemoActivity, type ApiRequestResult, type StepExecutionResult } from "@/lib/demo-api"
import { DataSourceBadge } from "./shared"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"
import { EvidenceChecklist } from "./evidence-checklist"

type EvidenceActivityPageProps = {
  configRequest: ApiRequestResult | null
  healthRequest: ApiRequestResult | null
  stepResults: Partial<Record<number, StepExecutionResult>>
  disposition: HumanDisposition | null
  searchTerm: string
  onNavigate: (id: ViewId) => void
}

export function EvidenceActivityPage({ configRequest, healthRequest, stepResults, disposition, searchTerm, onNavigate }: EvidenceActivityPageProps) {
  const { selectedDraft, isExampleMode, isCapstoneMode } = useInitiativeWorkspace()
  const query = searchTerm.trim().toLowerCase()
  const allActivity = getDemoActivity(configRequest, healthRequest, stepResults)
  const activity = allActivity.filter(({ label, request }) => `${label} ${request.method} ${request.path} ${request.httpStatus ?? ""} ${request.error ?? ""}`.toLowerCase().includes(query))

  return (
    <div className="page-stack">
      <div className="business-page-heading">
        <div>
          <div className="overline">EVIDENCE &amp; ACTIVITY</div>
          <h1>See where findings come from.</h1>
          <p className="page-subtitle">{isCapstoneMode ? "Review the original technical test fixture separately from actual API requests captured in this browser session." : isExampleMode ? "The restaurant example contains fictional planning data only. API activity below is separate from the illustrative scenario." : selectedDraft ? "Review planning information separately from actual demo API requests captured in this browser session." : "Review actual API requests captured in this browser session. Local choices are not backend activity."}</p>
        </div>
      </div>

      <EvidenceChecklist />
      {isCapstoneMode && <section className="panel evidence-provenance-panel">
        <div className="panel-heading"><div><div className="overline">TECHNICAL CAPSTONE · ORIGINAL TEST FIXTURE</div><h2>Case-handling time reduction</h2></div><DataSourceBadge source="SIMULATED" /></div>
        <p className="panel-intro">These values are stored in the dashboard&apos;s local demo scenario. They are not returned by a factory service and must not be treated as measured business outcomes.</p>
        <div className="evidence-value-grid">
          <div><span>Baseline</span><strong>{demoScenario.baselineMinutes} min / case</strong></div>
          <div><span>Target</span><strong>{demoScenario.targetMinutes} min / case</strong></div>
          <div><span>Observed fixture</span><strong>{demoScenario.observedMinutes} min / case</strong></div>
        </div>
        <div className="evidence-source-note"><FileText size={15} aria-hidden="true" /><span>Source: local scenario fixture. No supporting business documents or evidence records are attached in this demo.</span></div>
      </section>}
      {isExampleMode && <section className="panel evidence-provenance-panel"><div className="panel-heading"><div><div className="overline">FICTIONAL EXAMPLE SANDBOX</div><h2>Checklist items are not source documents</h2></div><span className="local-data-badge">ILLUSTRATIVE</span></div><p className="panel-intro">The editable checklist contains fictional planning prompts only. No actual company information, source documents, factory responses, or measured outcomes are represented.</p><button className="text-button" onClick={() => onNavigate("example")}>Return to the demonstration <ArrowRight size={14} aria-hidden="true" /></button></section>}

      <section className="panel evidence-activity-panel">
        <div className="panel-heading"><div><div className="overline">FACTORY BACKEND · TECHNICAL ACTIVITY</div><h2>Recent API activity</h2></div><span className="mini-label">API REQUESTS ONLY</span></div>
        <p className="panel-intro">{isExampleMode ? "The technical API demonstration is independent from the restaurant illustration. Only requests actually made in this session appear here." : selectedDraft ? "These service requests are from the demo integration and are separate from this local planning draft." : "Only requests actually made in this browser session appear here. No persistent audit history is implied."}</p>
        {activity.length === 0 ? (
          <div className="activity-empty-state"><span className="activity-empty-icon"><Clock3 size={18} aria-hidden="true" /></span><div><strong>{allActivity.length === 0 ? "No API activity captured yet" : "No requests match this search"}</strong><p>{allActivity.length === 0 ? "Service checks and workflow requests will appear here after they are made. No history is fabricated or retained between page reloads." : "Try a different endpoint, workflow step, status code, or error message."}</p></div></div>
        ) : (
          <div className="evidence-request-list">
            {activity.map(({ id, label, request }) => {
              const backendResponded = request.upstreamResponded
              const outcome = backendResponded
                ? request.ok ? "Backend response" : "Backend error response"
                : request.httpStatus === null ? "No backend response" : "Proxy response"
              return (
                <article className="evidence-request" key={id}>
                  <div className="evidence-request-icon"><Clock3 size={15} aria-hidden="true" /></div>
                  <div className="evidence-request-main">
                    <div className="evidence-request-title"><strong>{label}</strong>{backendResponded && <DataSourceBadge source="LIVE" />}</div>
                    <code>{request.method} {request.path}</code>
                    <details className="evidence-response-details">
                      <summary>View response details</summary>
                      {request.error && <p className="api-error-message">{request.error}</p>}
                      <div className="evidence-response-meta"><span>{outcome}</span><span>{request.httpStatus === null ? "No HTTP status" : `HTTP ${request.httpStatus}`}</span><span>{request.durationMs} ms</span></div>
                      <pre>{request.payload === null ? "No response body was captured." : formatValue(request.payload)}</pre>
                    </details>
                  </div>
                  <time dateTime={request.requestedAt}>{formatTime(request.requestedAt)}</time>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {isCapstoneMode && <section className="panel evidence-session-note">
        <div><div className="overline">LOCAL WORKFLOW STATE</div><h2>Human disposition</h2></div>
        <p>{disposition ? `The selected demo choice is “${getHumanDispositionLabel(disposition)}.” It is held in browser memory and is sent with the third workflow request only when run.` : "No decision choice has been selected. A choice made on the decision page is held in browser memory; it is not a backend decision until sent with the third workflow request."}</p>
        <span className="evidence-source-note"><CircleHelp size={15} aria-hidden="true" /> Selecting a disposition does not authorize a hire, assignment, or production action.</span>
      </section>}
    </div>
  )
}

function formatValue(value: unknown) {
  if (typeof value === "string") return value
  try { return JSON.stringify(value, null, 2) } catch { return String(value) }
}

function formatTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
}
