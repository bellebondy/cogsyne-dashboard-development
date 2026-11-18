"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, BadgeInfo, ClipboardList, Gauge, RotateCcw, ShieldCheck, Users } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"
import { SectionHeader } from "./shared"

const stages = [
  { title: "The business problem", eyebrow: "A familiar operating challenge", icon: ClipboardList },
  { title: "The proposed AI", eyebrow: "A possible use of forecasting", icon: Gauge },
  { title: "What COMRADII would evaluate", eyebrow: "12 connected assurance perspectives", icon: ShieldCheck },
  { title: "Information to gather", eyebrow: "Evidence needed before any conclusion", icon: ClipboardList },
  { title: "Potential risks and gaps", eyebrow: "Questions to investigate, not findings", icon: BadgeInfo },
  { title: "Human decisions", eyebrow: "People stay accountable", icon: Users },
  { title: "Measuring success", eyebrow: "Agree on measures before a pilot", icon: Gauge },
] as const

const factoryQuestions = [
  { id: "F1", name: "People & Skills", question: "Would restaurant managers and employees have the skills to use forecasts well?", detail: "What training, guidance, and human oversight would help people question or override a recommendation?" },
  { id: "F2", name: "Processes & Operations", question: "How would recommendations fit the restaurant's current routines?", detail: "Where would a manager review a forecast, and how could they override one that does not fit the situation?" },
  { id: "F3", name: "Product Assurance", question: "Would the proposed system meet the needs of the people using it?", detail: "Clarify intended users, the business problem, usability needs, and requirements for a useful result." },
  { id: "F4", name: "Project Readiness", question: "Is there a practical plan for exploring the idea?", detail: "Identify an owner, milestones, dependencies, resources, and a limited pilot scope." },
  { id: "F5", name: "Program Assurance", question: "How could the initiative interact with other restaurant priorities?", detail: "Consider operational changes, timing, and coordination with other business programs." },
  { id: "F6", name: "Performance", question: "Would forecasting improve the outcomes that matter?", detail: "Define measures for wait times, waste, staffing efficiency, and service quality, with a baseline and review period." },
  { id: "F7", name: "Technical Assurance", question: "Is the system reliable and suitable for its intended use?", detail: "Review forecast quality, reliability, integration needs, monitoring, and what happens when information is missing." },
  { id: "F8", name: "Compounded Intelligence", question: "How could issues in one area affect another?", detail: "For example, an inaccurate forecast could contribute to a staffing shortage, longer waits, and lower customer satisfaction." },
  { id: "F9", name: "Assurance Intelligence", question: "How strong would the supporting evidence be?", detail: "Make assumptions, evidence gaps, open risks, and confidence limits visible before drawing conclusions." },
  { id: "F10", name: "Cyber Assurance", question: "Would operational systems and information be appropriately protected?", detail: "Review access, security controls, data handling, and the responsibilities of any service providers." },
  { id: "F11", name: "Talent Assurance", question: "Would additional expertise or support be needed?", detail: "Consider employee training, specialist skills, and whether qualified external support is required." },
  { id: "F12", name: "Business Readiness", question: "Is the broader business case sufficiently supported to proceed?", detail: "Weigh expected benefits, costs, operational impacts, risks, and alternatives before deciding." },
] as const

const measures = [
  { name: "Average customer wait", how: "Compare consistently measured waits across comparable periods." },
  { name: "Ingredient waste", how: "Track waste using an agreed definition and inventory records." },
  { name: "Forecast accuracy", how: "Compare forecasts with observed demand using a chosen error measure." },
  { name: "Staffing efficiency", how: "Review coverage, overtime, and workload alongside service quality." },
  { name: "Customer satisfaction", how: "Use an existing, consistently collected feedback measure." },
] as const

const evidenceExamples = [
  "Authorized historical customer traffic and reservation patterns, if available",
  "Historical food orders and day-of-week or seasonal trends",
  "Staffing requirements and coverage patterns",
  "Inventory usage and ingredient waste records",
  "Current wait-time and customer-satisfaction measurement methods",
]

const potentialRisks = [
  "Forecasts may be inaccurate when demand patterns change or information is incomplete.",
  "A recommendation could create understaffing or overstaffing if people treat it as an instruction.",
  "Historical patterns may not represent new events, local conditions, or unusual demand.",
  "Operational and customer information needs clear access, privacy, retention, and security controls.",
  "Benefits, costs, integrations, and employee impacts have not been established in this illustration.",
]

export function CheesecakeDemoPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const { selectedDraft, resetExample } = useInitiativeWorkspace()
  const [activeStage, setActiveStage] = useState(0)
  const stage = stages[activeStage]
  const StageIcon = stage.icon

  return (
    <div className="page-stack cheesecake-demo-page">
      <SectionHeader
        eyebrow="ILLUSTRATIVE DEMO SCENARIO · NOT AN ASSESSMENT"
        title="The Cheesecake Factory — Illustrative Demo Workspace"
        description="Explore how an organization might plan an AI transformation, what COMRADII could help evaluate, and which decisions remain with people."
        action={<div className="initiative-heading-actions"><button className="button button-outline" onClick={() => { if (window.confirm("Reset this local sandbox to the original fictional example? Your sandbox edits will be replaced.")) resetExample() }}><RotateCcw size={14} aria-hidden="true" />Reset Example</button><button className="button button-outline" onClick={() => onNavigate("F4")}><ArrowLeft size={14} aria-hidden="true" />Back to initiatives</button></div>}
      />

      <div className="illustrative-disclaimer" role="note">
        <BadgeInfo size={17} aria-hidden="true" />
        <span><strong>Fictional educational example.</strong> Illustrative scenario only. Not affiliated with or endorsed by The Cheesecake Factory.</span>
      </div>

      <section className="scenario-intro panel">
        <div className="scenario-intro-icon"><Gauge size={22} aria-hidden="true" /></div>
        <div>
          <span className="overline">PROPOSED AI INITIATIVE</span>
          <h2>AI-Powered Restaurant Demand Forecasting</h2>
          <p>A fictional restaurant team is exploring whether demand forecasts could help managers plan for busy periods, prepare resources, reduce waste, and support a good customer experience.</p>
          <span className="illustrative-status">Planning illustration · No actual company data or results</span>
        </div>
      </section>

      {selectedDraft && <section className="panel scenario-workspace-summary"><div className="panel-heading"><div><div className="overline">EDITABLE LOCAL SANDBOX</div><h2>{selectedDraft.name}</h2></div><span className="planning-source-badge illustrative">FICTIONAL · NOT VERIFIED</span></div><p>{selectedDraft.objective}</p><div className="scenario-summary-metrics"><div><strong>{Object.values(selectedDraft.readinessAnswers).filter((answer) => answer.trim()).length} / 18</strong><span>Planning questions answered</span></div><div><strong>{selectedDraft.kpis.length}</strong><span>Illustrative KPIs</span></div><div><strong>{selectedDraft.actions.filter((action) => action.status !== "completed").length}</strong><span>Open planning actions</span></div><div><strong>{selectedDraft.evidence.length}</strong><span>Evidence checklist items</span></div></div><div className="scenario-workspace-links"><button className="button button-outline" onClick={() => onNavigate("overview")}>Open overview</button><button className="button button-outline" onClick={() => onNavigate("readiness")}>Readiness questions</button><button className="button button-outline" onClick={() => onNavigate("performance")}>KPIs &amp; outcomes</button><button className="button button-outline" onClick={() => onNavigate("people")}>People &amp; skills</button><button className="button button-outline" onClick={() => onNavigate("decision")}>Actions &amp; milestones</button><button className="button button-outline" onClick={() => onNavigate("evidence")}>Evidence checklist</button></div><p className="scenario-note">Edits are saved as a separate browser-local sandbox. Reset Example restores the fictional starting data; no real restaurant data, results, or decisions are implied.</p></section>}

      <div className="guided-demo-progress" aria-label="Guided demonstration stages">
        {stages.map((item, index) => (
          <button key={item.title} type="button" className={`guided-demo-stage-link ${activeStage === index ? "active" : ""} ${activeStage > index ? "visited" : ""}`} onClick={() => setActiveStage(index)} aria-current={activeStage === index ? "step" : undefined}>
            <span>{String(index + 1).padStart(2, "0")}</span><b>{item.title}</b>
          </button>
        ))}
      </div>

      <section className="panel guided-demo-content" aria-live="polite">
        <div className="guided-demo-content-header">
          <span className="guided-demo-content-icon"><StageIcon size={19} aria-hidden="true" /></span>
          <div><span className="overline">{stage.eyebrow}</span><h2>{stage.title}</h2></div>
          <span className="guided-demo-stage-count">{activeStage + 1} of {stages.length}</span>
        </div>
        {activeStage === 0 && <div className="guided-demo-copy-block">
          <p>Restaurants can see demand change throughout the day and across seasons. When managers cannot anticipate customer traffic, food orders, staffing needs, preparation time, and ingredient demand, planning becomes harder.</p>
          <div className="demo-outcome-grid">{["Longer customer waits", "Over- or understaffing", "Unnecessary food waste", "Inefficient kitchen preparation", "Unpredictable operating costs", "Lower customer satisfaction"].map((item) => <div key={item}><span className="demo-outcome-dot" />{item}</div>)}</div>
          <div className="scenario-callout"><strong>Proposed business goals</strong><span>Reduce customer wait times · Improve staffing decisions · Reduce unnecessary food waste · Improve kitchen preparation efficiency · Maintain customer service quality.</span></div>
          <p className="scenario-note">These are proposed goals for the fictional scenario, not verified achievements or findings about The Cheesecake Factory.</p>
        </div>}
        {activeStage === 1 && <div className="guided-demo-copy-block">
          <p>The proposed idea is to explore an AI system that estimates future demand and offers planning recommendations to authorized managers. It could potentially consider authorized historical information such as customer traffic, reservations, food orders, seasonal and day-of-week trends, staffing requirements, and inventory usage.</p>
          <div className="scenario-callout"><strong>What this could support</strong><span>Managers could compare expected demand with staffing, preparation, and inventory plans—then use their knowledge to adjust those plans.</span></div>
          <p className="scenario-note">These are examples of information that might be considered, not confirmed data sources or current systems used by the company.</p>
        </div>}
        {activeStage === 2 && <div className="guided-demo-copy-block">
          <p>COMRADII's factory architecture is designed to help an organization look at an AI initiative from connected perspectives. These are illustrative assessment questions, not completed factory assessments, ratings, certifications, or approved decisions.</p>
          <div className="factory-question-grid">{factoryQuestions.map((item) => <article className="factory-question-card" key={item.id}>
            <div className="factory-question-heading"><span>{item.id}</span><strong>{item.name}</strong></div>
            <p>{item.question}</p><small>{item.detail}</small>
          </article>)}</div>
          <div className="scenario-callout compounded-example"><strong>Why the perspectives connect</strong><span>An inaccurate forecast could affect staffing decisions; that could lead to longer waits and affect customer experience. The connected review helps teams consider those relationships rather than treating each question in isolation.</span></div>
        </div>}
        {activeStage === 3 && <div className="guided-demo-copy-block">
          <p>Before drawing conclusions, an organization would need to identify what information is authorized, reliable, relevant, and appropriate to use. These are examples to investigate—not records known to exist or be in use.</p>
          <ul className="demo-evidence-list">{evidenceExamples.map((item) => <li key={item}>{item}</li>)}</ul>
          <div className="scenario-callout"><strong>Good evidence has context</strong><span>Confirm the data owner, permitted use, time period, quality, gaps, and who can review it. Avoid placing personal or confidential information in this public illustration.</span></div>
        </div>}
        {activeStage === 4 && <div className="guided-demo-copy-block">
          <p>These are realistic questions a team might investigate before a pilot. None are findings about the company or the proposed system.</p>
          <div className="risk-question-list">{potentialRisks.map((item) => <div key={item}><BadgeInfo size={15} aria-hidden="true" /><span>{item}</span></div>)}</div>
        </div>}
        {activeStage === 5 && <div className="guided-demo-copy-block">
          <p>A manager or authorized business leader—not an AI forecast—would decide whether the idea should move forward and under what safeguards.</p>
          <div className="human-decision-grid">
            <article><strong>Before a pilot</strong><p>Confirm the business problem, permitted information, accountable owner, and approval path.</p></article>
            <article><strong>During a pilot</strong><p>Review forecast quality and operational effects; allow people to question or override recommendations.</p></article>
            <article><strong>At a review point</strong><p>Compare evidence with agreed goals, risks, costs, and alternatives before deciding to continue, adjust, or stop.</p></article>
          </div>
          <p className="scenario-note">This demonstration makes no recommendation or implementation decision.</p>
        </div>}
        {activeStage === 6 && <div className="guided-demo-copy-block">
          <p>Agree on a baseline, measurement owner, data source, and review period before testing. Compare like with like and consider service quality alongside efficiency.</p>
          <div className="demo-measure-grid">{measures.map((metric) => <article key={metric.name}><span className="overline">POTENTIAL MEASURE</span><strong>{metric.name}</strong><p>{metric.how}</p></article>)}</div>
          <div className="scenario-callout"><strong>Illustrative goals—not achieved results</strong><span>A future pilot might set a goal such as reducing wait time or ingredient waste while maintaining customer satisfaction. The baseline, target, and acceptable trade-offs would need to be agreed by authorized decision-makers. No values or improvements are measured here.</span></div>
        </div>}
        <div className="guided-demo-navigation">
          <button className="button button-outline" onClick={() => setActiveStage((value) => Math.max(0, value - 1))} disabled={activeStage === 0}><ArrowLeft size={14} aria-hidden="true" />Previous</button>
          {activeStage < stages.length - 1 ? <button className="button button-dark" onClick={() => setActiveStage((value) => Math.min(stages.length - 1, value + 1))}>Continue <ArrowRight size={14} aria-hidden="true" /></button> : <button className="button button-dark" onClick={() => onNavigate("F4")}>Plan your own initiative <ArrowRight size={14} aria-hidden="true" /></button>}
        </div>
      </section>

      <div className="scenario-note demo-disclaimer-bottom"><BadgeInfo size={15} aria-hidden="true" />This educational scenario is separate from the temporary technical Capstone Showcase and its fixed API test fixture.</div>
    </div>
  )
}
