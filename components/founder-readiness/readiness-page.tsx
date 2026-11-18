import { ArrowRight, CircleHelp, ShieldAlert } from "lucide-react"
import { CHEESECAKE_DEMO_ID, TECHNICAL_FIXTURE_ID, type ViewId } from "@/lib/founder-demo-data"
import type { ApiRequestResult } from "@/lib/demo-api"
import { assessmentAreas, useInitiativeWorkspace } from "@/lib/initiative-workspace"
import { FactoryHealthPanel } from "./scenario-components"

type ReadinessPageProps = {
  healthRequest: ApiRequestResult | null
  healthPayload: unknown
  configRequest: ApiRequestResult | null
  configPayload: unknown
  onRefresh: () => void
  refreshing: boolean
  actionsDisabled: boolean
  onNavigate: (id: ViewId) => void
}

export function ReadinessPage({ healthRequest, healthPayload, configRequest, configPayload, onRefresh, refreshing, actionsDisabled, onNavigate }: ReadinessPageProps) {
  const { selectedDraft, selectedId } = useInitiativeWorkspace()
  return (
    <div className="page-stack">
      <div className="business-page-heading">
        <div>
          <div className="overline">READINESS &amp; ASSURANCE</div>
          <h1>Understand what has—and hasn&apos;t—been assessed.</h1>
          <p className="page-subtitle">Service availability is not the same as organizational readiness. This demo reports only the evidence and service responses it can actually verify.</p>
        </div>
      </div>

      <section className="readiness-status-grid" aria-label="Current assurance status">
        <article className="panel readiness-status-card">
          <div className="readiness-status-heading"><span className="readiness-status-icon unavailable"><ShieldAlert size={18} aria-hidden="true" /></span><span className="overline">ORGANIZATION-LEVEL ASSURANCE</span></div>
          <strong>Not available</strong>
          <p>No validated overall readiness rating or assurance score is provided by this dashboard demo.</p>
        </article>
        <article className="panel readiness-status-card">
          <div className="readiness-status-heading"><span className="readiness-status-icon simulated"><CircleHelp size={18} aria-hidden="true" /></span><span className="overline">ASSESSMENT EVIDENCE</span></div>
          <strong>Scenario fixture only</strong>
          <p>{selectedId === CHEESECAKE_DEMO_ID ? "The fictional restaurant scenario has no actual business evidence, completed factory responses, or live outcome." : "The original technical test fixture uses simulated case-handling values, not uploaded business evidence or a live factory assessment."}</p>
          <button className="text-button" onClick={() => onNavigate("evidence")}>Review evidence and activity <ArrowRight size={14} aria-hidden="true" /></button>
        </article>
      </section>

      <section className="section-block readiness-areas-section">
        <div className="section-heading"><div><div className="overline">PRELIMINARY REVIEW AREAS</div><h2>{selectedDraft ? selectedDraft.name : selectedId === CHEESECAKE_DEMO_ID ? "The Cheesecake Factory · Illustrative Demo" : selectedId === TECHNICAL_FIXTURE_ID ? "Original technical test fixture" : "Choose an initiative to begin"}</h2></div>{!selectedDraft && selectedId !== CHEESECAKE_DEMO_ID && selectedId !== TECHNICAL_FIXTURE_ID && <button className="button button-outline" onClick={() => onNavigate("F4")}>Choose initiative <ArrowRight size={14} aria-hidden="true" /></button>}</div>
        <p className="panel-intro">These questions organize planning only. They are not factory assessments, compliance checks, or an overall readiness rating.</p>
        <div className="readiness-area-grid">{assessmentAreas.map((area) => {
          const selected = selectedDraft?.assessmentAreas.includes(area.id) ?? false
          const provided = selectedDraft ? ({
            people: [selectedDraft.peopleImpacted, selectedDraft.peopleSkills, selectedDraft.resourceNeeds],
            processes: [selectedDraft.challenge, selectedDraft.currentProcess],
            product: [selectedDraft.intendedUse],
            delivery: [selectedDraft.department],
            performance: [selectedDraft.successMetric, selectedDraft.baseline, selectedDraft.target, selectedDraft.measurementPeriod],
            security: [],
          }[area.id].filter(Boolean)) : []
          return <article className="panel readiness-area-card" key={area.id}><div className="readiness-area-title"><span className={`readiness-status-icon ${selected ? "simulated" : "unavailable"}`}><CircleHelp size={16} aria-hidden="true" /></span><div><h3>{area.label}</h3><span className="local-data-badge">{selectedDraft ? selected ? "IN PLAN" : "NOT SELECTED" : "NOT ASSESSED"}</span></div></div><p>{area.why}</p><div className="readiness-area-info"><strong>Information to consider</strong><ul>{area.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="readiness-area-info"><strong>Planning information provided</strong>{provided.length ? <ul>{provided.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{selectedDraft ? "No related details in this local draft yet." : "No user-provided planning information."}</p>}</div><div className="readiness-area-next"><strong>Potential next review step</strong><span>{area.id === "security" ? "Identify an appropriate security or risk reviewer and applicable requirements." : `Confirm what evidence or information would be needed for ${area.label.toLowerCase()}.`}</span></div></article>
        })}</div>
        <div className="scenario-caution"><CircleHelp size={15} aria-hidden="true" /><span>{selectedDraft ? "Draft information is user-entered and locally stored. No uploaded or backend-verified evidence or factory assessment is available." : selectedId === CHEESECAKE_DEMO_ID ? "The restaurant example is fictional. Its questions are illustrative only; no factory assessment, rating, or decision has been completed." : selectedId === TECHNICAL_FIXTURE_ID ? "The original technical test fixture is separate from the restaurant illustration. Its scenario values are simulated; no live assessment result is available." : "Select an initiative to see its planning context. No assessment is available until an authorized assurance process provides one."}</span></div>
      </section>

      <FactoryHealthPanel
        healthRequest={healthRequest}
        healthPayload={healthPayload}
        configRequest={configRequest}
        configPayload={configPayload}
        onRefresh={onRefresh}
        refreshing={refreshing}
        actionsDisabled={actionsDisabled}
        technicalDetails={false}
      />

      <div className="scenario-caution"><CircleHelp size={15} aria-hidden="true" /><span>A successful service health response confirms reachability only. It does not certify an initiative, establish evidence quality, or produce an assurance decision.</span></div>
    </div>
  )
}
