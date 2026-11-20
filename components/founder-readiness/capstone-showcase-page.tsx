import { ArrowRight, ArrowUpRight, CircleCheck, CircleHelp, Code2, Network, ShieldCheck, Workflow } from "lucide-react"
import { scenarioSteps, type FactoryId, type ViewId } from "@/lib/founder-demo-data"
import type { ApiRequestResult, StepExecutionResult } from "@/lib/demo-api"
import { FactoryHealthPanel } from "./scenario-components"

const architecture = [
  { id: "F1", name: "People", responsibility: "Workforce roles, capabilities, qualification evidence, and skills gaps." },
  { id: "F2", name: "Process", responsibility: "Workflows, controls, human oversight, and process evidence." },
  { id: "F3", name: "Product", responsibility: "Requirements, intended use, fit-for-purpose, quality, and revalidation." },
  { id: "F4", name: "Project", responsibility: "Project readiness, dependencies, corrective actions, and release evidence." },
  { id: "F5", name: "Program", responsibility: "Portfolio coherence, shared resources, dependencies, and sequencing." },
  { id: "F6", name: "Performance", responsibility: "Expected versus realized outcomes, economics, and value leakage." },
  { id: "F7", name: "Technical Assurance", responsibility: "AI, model, agent, software, and API technical verification." },
  { id: "F8", name: "Compounded Intelligence", responsibility: "Cross-factory dependencies, contradictions, impact analysis, and systemic risks." },
  { id: "F9", name: "Assurance Intelligence", responsibility: "Assurance ratings, evidence confidence, coverage, residual risk, and hard gates." },
  { id: "F10", name: "Cyber Assurance", responsibility: "Cybersecurity events, affected assets, risks, and security-related changes." },
  { id: "F11", name: "Talent Assurance & Marketplace", responsibility: "Talent and provider marketplace readiness using authoritative assurance states." },
  { id: "F12", name: "Venture / Operator / Capital Readiness", responsibility: "Evidence-backed venture, operator, capital, and business readiness." },
] as const

const demoFactoryIds: FactoryId[] = ["F1", "F4", "F6", "F11"]
const detailViewByFactory: Record<FactoryId, ViewId> = { F1: "capstone-F1", F4: "capstone-F4", F6: "capstone-F6", F11: "capstone-F11" }
const sharedSystems = ["Cogsyne Assurance Graph", "Evidence Management", "Workflow and Gate Engine", "Human Disposition and Remediation", "Agent Factory and Orchestration", "Reporting and Audit", "Identity and Administration", "Integration Framework"]

export function CapstoneShowcasePage({ onNavigate, stepResults, healthRequest, healthPayload, configRequest, configPayload, onRefreshServices, refreshing, actionsDisabled, searchTerm }: {
  onNavigate: (id: ViewId) => void
  stepResults: Partial<Record<number, StepExecutionResult>>
  healthRequest: ApiRequestResult | null
  healthPayload: unknown
  configRequest: ApiRequestResult | null
  configPayload: unknown
  onRefreshServices: () => void
  refreshing: boolean
  actionsDisabled: boolean
  searchTerm: string
}) {
  const query = searchTerm.trim().toLowerCase()
  const visibleArchitecture = architecture.filter((factory) => `${factory.id} ${factory.name} ${factory.responsibility}`.toLowerCase().includes(query))

  return (
    <div className="page-stack capstone-page">
      <div className="business-page-heading capstone-heading">
        <div>
          <div className="overline">Cogsyne AI · UNIVERSITY CAPSTONE</div>
          <h1>Capstone Showcase</h1>
          <p className="page-subtitle">An initial technical implementation of the AI Transformation Assurance vision—not a completed production platform.</p>
        </div>
        <span className="showcase-status">INITIAL IMPLEMENTATION</span>
      </div>

      <section className="showcase-hero">
        <div className="showcase-hero-icon"><Network size={22} aria-hidden="true" /></div>
        <div className="showcase-hero-copy">
          <span className="overline">PROJECT OVERVIEW</span>
          <h2>From business objectives to evidence-informed decisions.</h2>
          <p>Cogsyne AI is designed to help organizations plan, evaluate, and monitor AI transformation. This capstone demonstrates an early, bounded workflow across four factory services, with a human decision point between performance review and downstream assessment.</p>
        </div>
        <button className="button button-dark" onClick={() => onNavigate("demo")}>Open five-step demo <ArrowRight size={15} aria-hidden="true" /></button>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="overline">SHARED ASSURANCE ARCHITECTURE</div><h2>Twelve factory responsibilities</h2></div><span className="mini-label">4 IN THE DEMONSTRATION</span></div>
        <p className="architecture-intro">The architecture is intended to work as one assurance system. Only F1, F4, F6, and F11 appear in the current guided workflow; the other responsibilities are architecture scope, not operational integrations in this dashboard.</p>
        <div className="architecture-grid">
          {visibleArchitecture.map((factory) => {
            const demonstrated = demoFactoryIds.includes(factory.id as FactoryId)
            const content = <>
              <div className="architecture-card-top"><span className={`factory-symbol ${demonstrated ? "mint" : "violet"}`}>{factory.id}</span><span className={`architecture-status ${demonstrated ? "in-demo" : "planned"}`}>{demonstrated ? "In guided demo" : "Architecture scope"}</span></div>
              <h3>{factory.name}</h3>
              <p>{factory.responsibility}</p>
              {demonstrated && <span className="architecture-open">View current example <ArrowUpRight size={13} aria-hidden="true" /></span>}
            </>
            return demonstrated
              ? <button type="button" className="panel architecture-card architecture-card-link" key={factory.id} onClick={() => onNavigate(detailViewByFactory[factory.id as FactoryId])}>{content}</button>
              : <article className="panel architecture-card" key={factory.id}>{content}</article>
          })}
          {visibleArchitecture.length === 0 && <div className="empty-search"><CircleHelp size={16} aria-hidden="true" />No factory responsibilities match “{searchTerm}”.</div>}
        </div>
        <div className="comradii-note"><CircleHelp size={16} aria-hidden="true" /><p><strong>Cogsyne AI is decision intelligence—not Factory 13.</strong> It may provide recommendations; it is not an autonomous decision authority.</p></div>
      </section>

      <section className="panel showcase-workflow-panel">
        <div className="panel-heading"><div><div className="overline">WORKING FIVE-STEP DEMONSTRATION</div><h2>F4 Project → F6 Performance → Human Decision → F1 People → F11 Talent</h2></div><button className="text-button" onClick={() => onNavigate("demo")}>View guided demo <ArrowRight size={14} aria-hidden="true" /></button></div>
        <p className="panel-intro">The dashboard orchestrates these calls sequentially through its server-side API proxy. Factory services do not call one another. Only the request results shown here are live backend activity. This original technical test fixture uses a 10-minute baseline, 8-minute target, and 9-minute simulated observation; it does not assess the restaurant illustration.</p>
        <div className="showcase-workflow-steps">
          {scenarioSteps.map((step, index) => {
            const result = stepResults[index]
            const status = result?.successful ? "Backend response received" : result ? "Request stopped" : "Not run in this session"
            return <button type="button" className="showcase-workflow-step" key={step.id} onClick={() => onNavigate(step.view)}>
              <span className="showcase-step-index">0{index + 1}</span>
              <span className="workflow-step-code">{step.id === "decision" ? "HUMAN" : step.id}</span>
              <strong>{step.title}</strong>
              <small>{status}</small>
            </button>
          })}
        </div>
        <div className="showcase-governance"><ShieldCheck size={16} aria-hidden="true" /><p>Recommendations do not authorize real-world action. The scenario expects an internal HTTP 403, but it is labeled expected—not observed—until the backend trace confirms it. An HTTP 200 workflow response and an internal HTTP 403 remain distinct.</p></div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="overline">TECHNICAL INTEGRATION</div><h2>What this implementation demonstrates</h2></div><Code2 size={18} aria-hidden="true" /></div>
        <div className="showcase-integration-grid">
          <article className="panel showcase-integration-card"><span className="integration-icon"><Workflow size={18} aria-hidden="true" /></span><h3>Server-side API proxy</h3><p>Backend requests stay behind the Next.js proxy and use the server-configured backend URL. The browser does not call factory services directly.</p><code>GET /api/config · GET /api/health · POST /api/step/1–5</code></article>
          <article className="panel showcase-integration-card"><span className="integration-icon"><CircleCheck size={18} aria-hidden="true" /></span><h3>Inspectable responses</h3><p>Workflow details expose actual HTTP status, response body, duration, backend status, and trace fields when the service returns them.</p><button className="text-button" onClick={() => onNavigate("capstone-evidence")}>Open evidence and activity <ArrowRight size={14} aria-hidden="true" /></button></article>
          <article className="panel showcase-integration-card"><span className="integration-icon"><ShieldCheck size={18} aria-hidden="true" /></span><h3>Human review boundary</h3><p>A disposition is chosen by a person and sent with the third workflow request. It is not approval to hire, assign, or execute.</p><button className="text-button" onClick={() => onNavigate("capstone-decision")}>Review the decision step <ArrowRight size={14} aria-hidden="true" /></button></article>
        </div>
      </section>

      <section className="panel showcase-status-panel">
        <div className="panel-heading"><div><div className="overline">IMPLEMENTATION STATUS</div><h2>Working, simulated, and still to build</h2></div></div>
        <div className="implementation-status-grid">
          <StatusColumn title="Working in this dashboard" items={["Five-step orchestration with workflow state carried between responses", "Config and health checks through the API proxy", "Per-request status, duration, errors, and expandable response details", "Local human disposition included only when the decision step is run"]} tone="working" />
          <StatusColumn title="Template-backed or simulated" items={["Factory output may be template-backed; inspect the response source fields", "Baseline 10, target 8, and observed 9 minutes are local scenario values", "People qualification and talent recommendation are scenario fixtures unless returned by the backend"]} tone="simulated" />
          <StatusColumn title="Not represented as complete" items={["The other eight factory responsibilities are not integrated in this dashboard demo", "No organization-level assurance rating or evidence coverage score is invented", "Production deployment, full evidence graph, and additional workflows remain future work"]} tone="planned" />
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><div><div className="overline">SHARED SYSTEMS IN THE PRODUCT VISION</div><h2>Designed to contribute to one assurance system</h2></div></div>
        <div className="shared-systems-list">{sharedSystems.map((system) => <span className="shared-system-chip" key={system}>{system}</span>)}</div>
      </section>

      <FactoryHealthPanel
        healthRequest={healthRequest}
        healthPayload={healthPayload}
        configRequest={configRequest}
        configPayload={configPayload}
        onRefresh={onRefreshServices}
        refreshing={refreshing}
        actionsDisabled={actionsDisabled}
      />
      <div className="scenario-caution"><CircleHelp size={15} aria-hidden="true" /><span>Service status depends on whether the configured backend is reachable from this environment. A public deployment cannot reach a backend running on a developer&apos;s local computer.</span></div>
    </div>
  )
}

function StatusColumn({ title, items, tone }: { title: string; items: string[]; tone: "working" | "simulated" | "planned" }) {
  return <section className={`implementation-status-column status-${tone}`}><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>
}
