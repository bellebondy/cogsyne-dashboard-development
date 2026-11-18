import { ArrowRight, CalendarDays, CircleHelp, Download, FileCheck2, ListChecks, Users } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import { getPlanningCompletion, getReadinessSnapshot, type InitiativeDraft } from "@/lib/planning-model"

export function InitiativeOverview({ draft, onNavigate, onExport }: { draft: InitiativeDraft; onNavigate: (id: ViewId) => void; onExport: () => void }) {
  const completion = getPlanningCompletion(draft)
  const readiness = getReadinessSnapshot(draft)
  const today = new Date().toISOString().slice(0, 10)
  const openActions = draft.actions.filter((action) => action.status !== "completed").sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"))
  const outstandingEvidence = draft.evidence.filter((item) => item.status !== "provided-by-user").length
  const upcomingMilestones = draft.milestones.filter((milestone) => milestone.status !== "completed" && (!milestone.dueDate || milestone.dueDate >= today)).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")).slice(0, 3)
  const milestonesToShow = upcomingMilestones.length ? upcomingMilestones : draft.milestones.filter((milestone) => milestone.status !== "completed").slice(0, 3)
  const nextView: ViewId = completion.stage === "Opportunity framing" ? "F4" : completion.stage === "Readiness planning" ? "readiness" : completion.stage === "Outcome planning" ? "performance" : completion.stage === "People and actions" ? (draft.stakeholders.length === 0 ? "people" : "decision") : completion.stage === "Evidence and milestones" ? (draft.evidence.length === 0 ? "evidence" : "decision") : "evidence"
  const nextLabel = nextView === "F4" ? "Update initiative details" : nextView === "readiness" ? "Continue readiness questions" : nextView === "performance" ? "Define a business KPI" : nextView === "people" ? "Identify a stakeholder" : nextView === "decision" ? "Review actions and milestones" : "Review the evidence checklist"

  return <div className="page-stack initiative-overview-page">
    <div className="business-page-heading initiative-overview-heading"><div><div className="overline">{draft.source === "illustrative" ? "FICTIONAL EDUCATIONAL SANDBOX" : "YOUR LOCAL PLANNING WORKSPACE"}</div><h1>{draft.name}</h1><p className="page-subtitle">{draft.objective || draft.goal || "Add a business objective to describe what you hope to improve."}</p></div><div className="initiative-heading-actions"><button className="button button-outline" onClick={onExport}><Download size={14} aria-hidden="true" />Export JSON</button><button className="button button-dark" onClick={() => onNavigate(nextView)}>{nextLabel}<ArrowRight size={14} aria-hidden="true" /></button></div></div>

    <section className="panel initiative-overview-summary"><div className="initiative-overview-summary-copy"><div className="overline">BUSINESS PROBLEM</div><p>{draft.challenge || "Describe the problem this initiative aims to address."}</p>{draft.intendedUse && <div className="initiative-overview-use"><span>Potential AI use</span><strong>{draft.intendedUse}</strong></div>}</div><div className="initiative-overview-stage"><span className="overline">CURRENT PLANNING STAGE</span><strong>{completion.stage}</strong><div className="planning-progress-track" role="progressbar" aria-label="Initiative planning completion" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${completion.percent}%` }} /></div><span>{completion.completed} of {completion.total} planning steps complete · {completion.percent}%</span></div></section>

    <section className="initiative-overview-metrics" aria-label="Initiative planning summary">
      <Metric label="Readiness questions" value={`${readiness.answered} / ${readiness.total}`} detail={`${readiness.areasReviewed} planning ${readiness.areasReviewed === 1 ? "area" : "areas"} reviewed`} icon={<ListChecks size={16} aria-hidden="true" />} onClick={() => onNavigate("readiness")} />
      <Metric label="KPIs defined" value={String(draft.kpis.length)} detail={`${draft.kpis.filter((kpi) => kpi.latestObserved !== null).length} with a user-entered observation`} icon={<CircleHelp size={16} aria-hidden="true" />} onClick={() => onNavigate("performance")} />
      <Metric label="Outstanding information" value={String(outstandingEvidence)} detail="Checklist items awaiting a response or review" icon={<FileCheck2 size={16} aria-hidden="true" />} onClick={() => onNavigate("evidence")} />
      <Metric label="Open actions" value={String(openActions.length)} detail={`${draft.stakeholders.length} stakeholder roles identified`} icon={<Users size={16} aria-hidden="true" />} onClick={() => onNavigate("decision")} />
    </section>

    <section className="initiative-overview-lower-grid">
      <article className="panel initiative-next-steps"><div className="panel-heading"><div><div className="overline">RECOMMENDED NEXT STEPS</div><h2>Based on this plan&apos;s missing information</h2></div><CircleHelp size={17} aria-hidden="true" /></div>
        {completion.nextSteps.length ? <div className="recommendation-list">{completion.nextSteps.slice(0, 4).map((step, index) => {
          const target: ViewId = step.includes("readiness") ? "readiness" : step.includes("KPI") || step.includes("measure") ? "performance" : step.includes("stakeholder") || step.includes("people") ? "people" : step.includes("action") || step.includes("milestone") ? "decision" : step.includes("evidence") || step.includes("information") ? "evidence" : "F4"
          return <button className="recommendation-row" key={step} onClick={() => onNavigate(target)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong><ArrowRight size={14} aria-hidden="true" /></button>
        })}</div> : <div className="overview-complete-note"><span className="planning-area-state complete">Planning prompts complete</span><p>All current planning sections contain information. This does not verify readiness or authorize implementation.</p><button className="text-button" onClick={() => onNavigate("readiness")}>Review answers again <ArrowRight size={14} aria-hidden="true" /></button></div>}
      </article>
      <article className="panel initiative-upcoming-panel"><div className="panel-heading"><div><div className="overline">PLANNING CALENDAR</div><h2>Upcoming milestones</h2></div><button className="text-button" onClick={() => onNavigate("decision")}>Manage <ArrowRight size={13} aria-hidden="true" /></button></div>
        {milestonesToShow.length ? <div className="upcoming-milestone-list">{milestonesToShow.map((milestone) => <div className="upcoming-milestone" key={milestone.id}><span className={`milestone-marker ${milestone.status}`} /><div><strong>{milestone.title}</strong><small>{milestone.dueDate ? formatDate(milestone.dueDate) : "Date not set"}{milestone.owner ? ` · ${milestone.owner}` : ""}</small></div><CalendarDays size={15} aria-hidden="true" /></div>)}</div> : <div className="overview-complete-note"><p>No milestones have been added yet.</p><button className="text-button" onClick={() => onNavigate("decision")}>Add a planning milestone <ArrowRight size={13} aria-hidden="true" /></button></div>}
      </article>
    </section>

    <section className="panel initiative-open-actions"><div className="panel-heading"><div><div className="overline">FOLLOW-UPS</div><h2>Open planning actions</h2></div><button className="text-button" onClick={() => onNavigate("decision")}>Open tracker <ArrowRight size={13} aria-hidden="true" /></button></div>
      {openActions.length ? <div className="overview-action-list">{openActions.slice(0, 4).map((action) => <div className="overview-action-row" key={action.id}><span className={`action-priority ${action.priority}`}>{action.priority}</span><strong>{action.title}</strong><small>{action.owner || "No owner"}</small><span>{action.dueDate ? formatDate(action.dueDate) : "No due date"}</span></div>)}</div> : <div className="overview-complete-note"><p>No open planning actions. Add a follow-up if information still needs to be gathered.</p><button className="text-button" onClick={() => onNavigate("decision")}>Create an action <ArrowRight size={13} aria-hidden="true" /></button></div>}
    </section>

    {draft.source === "illustrative" && <p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />Fictional, editable planning sandbox. It is not affiliated with or endorsed by The Cheesecake Factory. Example values are not company data, verified evidence, or measured outcomes.</p>}
  </div>
}

function Metric({ label, value, detail, icon, onClick }: { label: string; value: string; detail: string; icon: React.ReactNode; onClick: () => void }) {
  return <button className="panel initiative-overview-metric" onClick={onClick}><span className="initiative-overview-metric-icon">{icon}</span><span className="initiative-overview-metric-label">{label}</span><strong>{value}</strong><small>{detail}</small><ArrowRight size={13} aria-hidden="true" /></button>
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}
