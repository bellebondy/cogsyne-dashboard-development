import type { ReactNode } from "react"
import { ArrowRight, ArrowUpRight, CircleCheck, CircleHelp, CircleMinus, CircleX, FileCheck2, Folder, Gauge, GitBranch, ShieldAlert, Sparkles, UserRoundCheck, Users } from "lucide-react"
import { CHEESECAKE_DEMO_ID, TECHNICAL_FIXTURE_ID, demoScenario, factories, getHumanDispositionLabel, scenarioSteps, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { getDemoActivity, getFactoryHealth, type ApiRequestResult, type StepExecutionResult } from "@/lib/demo-api"
import { DataSourceBadge } from "./shared"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

export function OverviewPage({ onNavigate, onDemo, onRefreshServices, searchTerm, disposition, stepResults, configRequest, healthRequest, healthPayload, refreshing, actionsDisabled }: {
  onNavigate: (id: ViewId) => void
  onDemo: () => void
  onRefreshServices: () => void
  searchTerm: string
  disposition: HumanDisposition | null
  stepResults: Partial<Record<number, StepExecutionResult>>
  configRequest: ApiRequestResult | null
  healthRequest: ApiRequestResult | null
  healthPayload: unknown
  refreshing: boolean
  actionsDisabled: boolean
}) {
  const { drafts, selectedId, selectedDraft, selectInitiative } = useInitiativeWorkspace()
  const query = searchTerm.trim().toLowerCase()
  const matches = (terms: string[]) => !query || terms.some((term) => term.toLowerCase().includes(query))
  const showInitiative = selectedId === TECHNICAL_FIXTURE_ID && matches(["case handling time reduction", demoScenario.objective, "ai initiative", "baseline target observed"])
  const showAttention = selectedId === TECHNICAL_FIXTURE_ID && matches(["performance", "finding", "above target", "handling time"])
  const showAssurance = matches(["evidence", "readiness", "assurance", "rating"])
  const showServices = Boolean(query) && matches(["service", "backend", "health", "connection"])
  const showDecision = matches(["decision", "next step", "human review", "disposition"])
  const showActivity = matches(["activity", "requests", "api", "session"])
  const showWorkflow = matches(["workflow", "demo", "recommendation", "steps"])
  const hasResults = [showInitiative, showAttention, showAssurance, showServices, showDecision, showActivity, showWorkflow].some(Boolean)
  const activity = getDemoActivity(configRequest, healthRequest, stepResults)
  const healthyResponse = Boolean(healthRequest?.upstreamResponded && healthRequest.ok)
  const openExample = () => { selectInitiative(CHEESECAKE_DEMO_ID); onNavigate("example") }

  if (!query) return (
    <div className="page-stack customer-home">
      <div className="welcome-row customer-home-welcome">
        <div><div className="overline">AI TRANSFORMATION PLANNING</div><h1>Make your next AI decision with confidence.</h1><p className="page-subtitle">COMRADII helps you clarify an AI opportunity, plan what should be evaluated, organize evidence, and understand the next step—with people in control.</p></div>
      </div>
      <section className="home-path-grid" aria-label="Start or explore an initiative">
        <article className="panel home-path-card home-path-primary"><div className="home-path-mark"><Folder size={20} aria-hidden="true" /></div><span className="overline">YOUR BUSINESS GOAL</span><h2>Start an AI initiative</h2><p>Describe what you want to accomplish, add business context, and choose the areas you want to plan for review.</p><button className="button button-dark" onClick={() => onNavigate("F4")}>Start an initiative <ArrowRight size={15} aria-hidden="true" /></button></article>
        <article className="panel home-path-card"><div className="home-path-mark example"><Sparkles size={20} aria-hidden="true" /></div><span className="overline">FICTIONAL EDUCATIONAL EXAMPLE</span><h2>The Cheesecake Factory — Demo Scenario</h2><p>A fictional educational walkthrough of restaurant demand forecasting, the questions COMRADII could help organize, and the decisions people would need to make.</p><small className="example-disclaimer">Illustrative scenario only. Not affiliated with or endorsed by The Cheesecake Factory.</small><button className="button button-outline" onClick={openExample}>Explore example <ArrowRight size={15} aria-hidden="true" /></button></article>
      </section>
      {selectedDraft ? <section className="panel home-next-step"><div className="home-next-icon"><ArrowRight size={18} aria-hidden="true" /></div><div><span className="overline">CONTINUE YOUR LOCAL PLANNING DRAFT</span><h2>{selectedDraft.name}</h2><p>{selectedDraft.nextStep || "Review the assessment areas and identify information that should be gathered next."}</p><span className="local-data-badge">LOCAL DRAFT · NOT AN ASSESSMENT</span></div><div className="home-next-actions"><button className="button button-dark" onClick={() => onNavigate("F4")}>Continue planning <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("readiness")}>Review areas</button></div></section> : selectedId === CHEESECAKE_DEMO_ID ? <section className="panel home-next-step"><div className="home-next-icon"><Sparkles size={18} aria-hidden="true" /></div><div><span className="overline">SELECTED ILLUSTRATIVE SCENARIO</span><h2>AI-powered restaurant demand forecasting</h2><p>This fictional walkthrough contains planning questions only—not company data, assessments, or measured outcomes.</p><span className="local-data-badge">EDUCATIONAL EXAMPLE</span></div><div className="home-next-actions"><button className="button button-dark" onClick={() => onNavigate("example")}>Continue walkthrough <ArrowRight size={14} aria-hidden="true" /></button></div></section> : <section className="panel home-next-step"><div className="home-next-icon"><CircleHelp size={18} aria-hidden="true" /></div><div><span className="overline">A PRACTICAL FIRST STEP</span><h2>Start with a business question</h2><p>Capture the outcome you want and the information you still need. Planning does not verify readiness or approve implementation.</p></div><button className="button button-outline" onClick={() => onNavigate("readiness")}>How readiness is reviewed <ArrowRight size={14} aria-hidden="true" /></button></section>}
      <section className="home-drafts-section"><div className="section-heading"><div><div className="overline">SAVED LOCALLY</div><h2>Your initiative drafts</h2></div><button className="text-button" onClick={() => { selectInitiative(null); onNavigate("F4") }}>View all initiatives <ArrowRight size={14} aria-hidden="true" /></button></div>
        {drafts.length ? <div className="home-draft-list">{drafts.slice(0, 3).map((draft) => <button className="home-draft-row" key={draft.id} onClick={() => { selectInitiative(draft.id); onNavigate("F4") }}><span><strong>{draft.name}</strong><small>{draft.objective || draft.goal || "Objective not yet described."}</small></span><span className="local-data-badge">LOCAL DRAFT</span><ArrowRight size={15} aria-hidden="true" /></button>)}</div> : <p className="home-drafts-empty">No saved initiative drafts yet. New drafts are stored only in this browser.</p>}
      </section>
      <nav className="home-workspace-links" aria-label="Continue to workspace sections"><button onClick={() => onNavigate("readiness")}><ShieldAlert size={16} aria-hidden="true" /><span><strong>Readiness &amp; assurance</strong><small>See planning questions and what remains unknown</small></span><ArrowRight size={14} aria-hidden="true" /></button><button onClick={() => onNavigate("evidence")}><FileCheck2 size={16} aria-hidden="true" /><span><strong>Evidence &amp; activity</strong><small>Review what was provided and actual service responses</small></span><ArrowRight size={14} aria-hidden="true" /></button></nav>
    </div>
  )

  return (
    <div className="page-stack business-overview">
      <div className="welcome-row business-welcome-row">
        <div><div className="overline">TECHNICAL CAPSTONE · ORIGINAL TEST FIXTURE <span className="demo-chip">SIMULATED SCENARIO</span></div><h1>Technical fixture overview<span className="title-dot">.</span></h1><p className="page-subtitle">Understand readiness, review key findings, and make informed decisions about the AI initiative shown in this workspace.</p></div>
        <button className="button button-dark" onClick={() => onNavigate("F4")}>View AI initiative <ArrowRight size={15} aria-hidden="true" /></button>
      </div>

      {/* Preserved for future reference; these technical totals are not actionable in the customer overview.
      <section className="metric-grid" aria-label="Scenario overview">
        <Metric label="Factory modules" value="4" icon={<Folder size={17} />} detail="F4 · F6 · F1 · F11" />
        <Metric label="Dependency steps" value="5" icon={<GitBranch size={17} />} detail="Includes a human decision" />
        <Metric label="Target" value={demoScenario.targetMinutes.toString()} suffix="min / case" icon={<Gauge size={17} />} detail="SIMULATED project target" />
        <Metric label="Observed fixture" value={demoScenario.observedMinutes.toString()} suffix="min / case" icon={<Users size={17} />} detail="SIMULATED performance result" />
      </section>
      */}

      {(showInitiative || showAttention) && <section className={`business-overview-grid ${showInitiative && showAttention ? "" : "single"}`}>
        {showInitiative && <article className="panel initiative-overview-card">
          <div className="panel-heading"><div><div className="overline">ORIGINAL TECHNICAL TEST FIXTURE</div><h2>Case handling time reduction</h2></div><DataSourceBadge source="SIMULATED" /></div>
          <p className="initiative-objective">{demoScenario.objective}</p>
          <div className="initiative-review-status"><span className={`review-status-dot ${stepResults[0]?.successful ? "received" : "not-started"}`} /><span>{stepResults[0]?.successful ? "A backend response is recorded for the initiative step" : "No backend review has been recorded in this session"}</span></div>
          <div className="initiative-measure-row" aria-label="Simulated baseline, observed result, and target">
            <Measure label="Baseline" value={`${demoScenario.baselineMinutes} min`} />
            <ArrowRight size={15} aria-hidden="true" />
            <Measure label="Observed" value={`${demoScenario.observedMinutes} min`} />
            <ArrowRight size={15} aria-hidden="true" />
            <Measure label="Target" value={`${demoScenario.targetMinutes} min`} />
          </div>
          <p className="initiative-measure-note"><DataSourceBadge source="SIMULATED" /> The observed fixture is one minute above the intended target; it is not live telemetry.</p>
          <div className="initiative-card-footer"><span>One example initiative in this demo workspace</span><button className="text-button" onClick={() => onNavigate("F4")}>View initiative details <ArrowUpRight size={14} aria-hidden="true" /></button></div>
        </article>}

        {showAttention && <article className="panel attention-overview-card">
          <div className="attention-overview-icon"><ShieldAlert size={18} aria-hidden="true" /></div>
          <div className="overline">WHAT NEEDS ATTENTION</div>
          <h2>Handling time remains above target</h2>
          <p>In the simulated scenario, handling time improved from 10 to 9 minutes per case but remains 1 minute above the 8-minute target.</p>
          <DataSourceBadge source="SIMULATED" />
          <button className="button button-outline" onClick={() => onNavigate("F6")}>Review performance finding <ArrowRight size={14} aria-hidden="true" /></button>
        </article>}
      </section>}

      {(showAssurance || showServices) && <section className={`business-overview-grid lower-overview-grid ${showAssurance && showServices ? "" : "single"}`}>
        {showAssurance && <article className="panel assurance-overview-card">
          <div className="panel-heading"><div><div className="overline">EVIDENCE &amp; READINESS</div><h2>No overall rating available</h2></div><span className="readiness-status-icon unavailable"><CircleHelp size={17} aria-hidden="true" /></span></div>
          <p>The current demo does not provide a validated organization-level readiness score. Scenario values are not assessment evidence.</p>
          <button className="text-button" onClick={() => onNavigate("readiness")}>Review assurance status <ArrowRight size={14} aria-hidden="true" /></button>
        </article>}

        {showServices && <article className="panel service-summary-card">
          <div className="panel-heading"><div><div className="overline">SERVICE CONNECTION</div><h2>{healthyResponse ? "Backend health response received" : healthRequest ? "Service check needs review" : "Service status not checked"}</h2></div>{healthRequest?.upstreamResponded && <DataSourceBadge source="LIVE" />}</div>
          <p>{healthRequest ? healthyResponse ? "The configured backend returned a health response. Individual service statuses may still be unreported." : healthRequest.upstreamResponded ? "The backend responded but did not confirm successful service health. Review technical details in the Capstone Showcase." : "The demo backend could not be reached from this environment. No service status is available." : "No backend call has been made for service health in this session."}</p>
          <button className="text-button" onClick={onRefreshServices} disabled={actionsDisabled}>{refreshing ? "Checking services…" : "Check service status"}<ArrowRight size={14} aria-hidden="true" /></button>
          {healthRequest?.upstreamResponded && healthRequest.ok && <div className="service-summary-list">{factories.map((factory) => {
            const status = getFactoryHealth(healthPayload, factory.id)
            const Icon = status === "online" ? CircleCheck : status === "offline" ? CircleX : CircleMinus
            const label = status === "online" ? "Responding" : status === "offline" ? "Unavailable" : "Not reported"
            return <div className="service-summary-row" key={factory.id}><Icon size={14} className={`service-summary-${status}`} aria-hidden="true" /><span>{factory.name}</span><small>{label}</small></div>
          })}</div>}
          <button className="service-detail-link" onClick={() => onNavigate("readiness")}>View readiness details</button>
        </article>}
      </section>}

      {(showDecision || showActivity) && <section className={`business-overview-grid lower-overview-grid ${showDecision && showActivity ? "" : "single"}`}>
        {showDecision && <article className="panel next-step-card">
          <div className="panel-heading"><div><div className="overline">DECISIONS &amp; NEXT STEPS</div><h2>Review the human decision</h2></div><span className="readiness-status-icon simulated"><UserRoundCheck size={17} aria-hidden="true" /></span></div>
          <p>{disposition ? `Your local demo choice is “${getHumanDispositionLabel(disposition)}.” It is not saved to the backend or an authorization to act.` : "No human disposition has been selected. Review the simulated finding and choose how the demo should continue."}</p>
          <button className="button button-outline" onClick={() => onNavigate("decision")}>{disposition ? "Review selected disposition" : "Review decision step"}<ArrowRight size={14} aria-hidden="true" /></button>
        </article>}

        {showActivity && <article className="panel recent-activity-card">
          <div className="panel-heading"><div><div className="overline">RECENT ACTIVITY</div><h2>Requests captured this session</h2></div><span className="readiness-status-icon"><FileCheck2 size={17} aria-hidden="true" /></span></div>
          {activity.length === 0 ? <div className="overview-empty-state"><Sparkles size={16} aria-hidden="true" /><p>No API activity captured yet. Requests will appear here after a service check or workflow step.</p></div> : <div className="overview-activity-list">{activity.slice(0, 4).map(({ id, label, request }) => <div className="overview-activity-row" key={id}><span className={request.upstreamResponded ? "activity-source-live" : "activity-source-proxy"} /><span className="overview-activity-label">{label}</span><strong>{request.httpStatus === null ? "No response" : `HTTP ${request.httpStatus}`}</strong></div>)}</div>}
          <button className="text-button" onClick={() => onNavigate("evidence")}>Open evidence and activity <ArrowRight size={14} aria-hidden="true" /></button>
        </article>}
      </section>}

      {showWorkflow && <section className="panel business-workflow-panel">
        <div className="panel-heading"><div><div className="overline">AVAILABLE REVIEW PATH</div><h2>From initiative to recommendation, with a human decision</h2></div><button className="text-button" onClick={onDemo}>Open technical demo <ArrowRight size={14} aria-hidden="true" /></button></div>
        <div className="business-workflow-steps">{scenarioSteps.map((step, index) => {
          const result = stepResults[index]
          const title = ["Define initiative", "Review performance", "Human decision", "Assess workforce", "Review talent recommendation"][index]
          const Icon = result?.successful ? CircleCheck : result ? CircleX : CircleMinus
          const status = result?.successful ? "Backend response received" : result ? "Request stopped" : "Not run"
          return <button key={step.id} className="business-workflow-step" onClick={() => onNavigate(step.view)}>
            <span className="business-workflow-index">0{index + 1}</span><strong>{title}</strong><small>{status}</small><Icon size={15} aria-hidden="true" />
          </button>
        })}</div>
      </section>}

      {query && !hasResults && <div className="empty-search"><CircleHelp size={16} aria-hidden="true" />No initiatives, findings, or workflow items match “{searchTerm}”.</div>}
    </div>
  )
}

function Measure({ label, value }: { label: string; value: string }) {
  return <div className="initiative-measure"><span>{label}</span><strong>{value}</strong></div>
}

function Metric({ label, value, suffix, icon, detail }: { label: string; value: string; suffix?: string; icon: ReactNode; detail: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}{suffix && <small>{suffix}</small>}</div><div className="metric-change"><DataSourceBadge source="SIMULATED" /><span className="metric-footnote">{detail}</span></div></article>
}
