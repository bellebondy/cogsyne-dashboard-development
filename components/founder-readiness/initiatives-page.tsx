"use client"

import { useState, type ChangeEvent } from "react"
import { ArrowLeft, ArrowRight, Check, CircleHelp, ClipboardCheck, Download, FileText, Plus, Save, Trash2 } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import { assessmentAreas, type AssessmentAreaId, type InitiativeDraft, useInitiativeWorkspace } from "@/lib/initiative-workspace"

type InitiativeForm = Pick<InitiativeDraft, "name" | "description" | "goal" | "objective" | "department" | "challenge" | "currentProcess" | "peopleImpacted" | "intendedUse" | "expectedBenefit" | "successLooksLike" | "peopleSkills" | "resourceNeeds" | "successMetric" | "baseline" | "target" | "unit" | "measurementPeriod" | "assessmentAreas">
type Screen = "home" | "wizard" | "draft"

const initialForm: InitiativeForm = {
  name: "",
  description: "",
  goal: "",
  objective: "",
  department: "",
  challenge: "",
  currentProcess: "",
  peopleImpacted: "",
  intendedUse: "",
  expectedBenefit: "",
  successLooksLike: "",
  peopleSkills: "",
  resourceNeeds: "",
  successMetric: "",
  baseline: "",
  target: "",
  unit: "",
  measurementPeriod: "",
  assessmentAreas: [],
}

const goalOptions = [
  "Improve customer experience",
  "Reduce repetitive work",
  "Improve business efficiency",
  "Introduce an AI product or service",
  "Support business decision-making",
  "Explore another opportunity",
]

export function InitiativesPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const { drafts, selectedId, selectedDraft, loaded, saveDraft, deleteDraft, selectInitiative, exportDraft } = useInitiativeWorkspace()
  const [screen, setScreen] = useState<Screen>("home")
  const [step, setStep] = useState(1)
  const [editingId, setEditingId] = useState<string | undefined>()
  const [form, setForm] = useState<InitiativeForm>(initialForm)
  const [savedMessage, setSavedMessage] = useState("")

  const beginDraft = (draft?: InitiativeDraft) => {
    setEditingId(draft?.id)
    setForm(draft ? {
      name: draft.name,
      description: draft.description ?? "",
      goal: draft.goal,
      objective: draft.objective,
      department: draft.department,
      challenge: draft.challenge,
      currentProcess: draft.currentProcess ?? "",
      peopleImpacted: draft.peopleImpacted ?? "",
      intendedUse: draft.intendedUse,
      expectedBenefit: draft.expectedBenefit,
      successLooksLike: draft.successLooksLike || draft.expectedBenefit || "",
      peopleSkills: draft.peopleSkills ?? "",
      resourceNeeds: draft.resourceNeeds ?? "",
      successMetric: draft.successMetric,
      baseline: draft.baseline,
      target: draft.target,
      unit: draft.unit,
      measurementPeriod: draft.measurementPeriod,
      assessmentAreas: draft.assessmentAreas,
    } : initialForm)
    setStep(1)
    setScreen("wizard")
    setSavedMessage("")
  }

  const updateField = (field: keyof InitiativeForm, value: string) => setForm((current) => ({ ...current, [field]: value }))
  const updateText = (field: keyof InitiativeForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => updateField(field, event.target.value)
  const toggleArea = (id: AssessmentAreaId) => setForm((current) => ({
    ...current,
    assessmentAreas: current.assessmentAreas.includes(id)
      ? current.assessmentAreas.filter((area) => area !== id)
      : [...current.assessmentAreas, id],
  }))
  const canContinue = step !== 1 || Boolean(form.goal || form.objective.trim())
  const canReview = step !== 2 || Boolean(form.name.trim() && form.challenge.trim())
  const missingReviewItems = [
    !form.currentProcess && "How the process works today",
    !form.peopleImpacted && "Who may be affected",
    !form.intendedUse && "What AI might help people do",
    !form.successMetric && "How improvement could be measured",
  ].filter((item): item is string => Boolean(item))

  const save = () => {
    const existing = editingId ? drafts.find((draft) => draft.id === editingId) : undefined
    const draft = saveDraft({
      ...form,
      expectedBenefit: form.successLooksLike || form.expectedBenefit,
      id: editingId,
      checklist: existing?.checklist,
      decisionNote: existing?.decisionNote,
      nextStep: existing?.nextStep,
    })
    setScreen("draft")
    setSavedMessage("Draft saved in this browser only. It has not been submitted to COMRADII services.")
    selectInitiative(draft.id)
  }

  const confirmDelete = (draft: InitiativeDraft) => {
    if (window.confirm(`Delete the local draft “${draft.name}”? This only removes the copy stored in this browser.`)) {
      deleteDraft(draft.id)
      setScreen("home")
    }
  }

  if (screen === "wizard") return <div className="page-stack initiative-page">
    <div className="business-page-heading"><div><div className="overline">LOCAL PLANNING WORKSPACE · STEP {step} OF 4</div><h1>{editingId ? "Edit your initiative" : "Start an AI initiative"}</h1><p className="page-subtitle">Begin with the business goal. This is preliminary planning—not an assessment or assurance result.</p></div><button className="button button-outline" onClick={() => setScreen("home")}><ArrowLeft size={15} aria-hidden="true" />Back to initiatives</button></div>
    <div className="initiative-stepper" aria-label="Initiative setup progress">{["Business goal", "Context", "Assessment areas", "Review"].map((label, index) => <button type="button" className={`initiative-step ${step === index + 1 ? "active" : step > index + 1 ? "complete" : ""}`} key={label} onClick={() => setStep(index + 1)} disabled={index + 1 > step} aria-current={step === index + 1 ? "step" : undefined}><span>{step > index + 1 ? <Check size={13} aria-hidden="true" /> : index + 1}</span><b>{label}</b></button>)}</div>
    <section className="panel initiative-form-panel">
      {step === 1 && <div className="initiative-form-step"><div className="overline">1 · BUSINESS GOAL</div><h2>What are you hoping to accomplish with AI?</h2><p className="panel-intro">Choose a goal if one fits, then describe the outcome in your own words. You can change it later.</p><div className="goal-option-grid" role="group" aria-label="Business goal options">{goalOptions.map((option) => <button type="button" key={option} className={`goal-option ${form.goal === option ? "selected" : ""}`} onClick={() => updateField("goal", option)} aria-pressed={form.goal === option}>{option}</button>)}</div><label className="initiative-field initiative-field-wide"><span>What would you like to improve?</span><textarea rows={3} value={form.objective} onChange={updateText("objective")} placeholder="Describe the change you hope to make for your customers, employees, or business." /></label><div className="initiative-example-help"><strong>Not sure what to write?</strong><p>We want to predict busy periods so our restaurant can prepare enough food, schedule appropriate staffing, and reduce customer wait times.</p><QuestionHelp title="Need help answering this?" explanation="Start with a business outcome, not a particular AI tool. Describe who or what you want to help and what could become easier or better." example="A useful answer names a practical change and who would benefit." why="A clear goal helps people decide later whether an AI idea is worth exploring." suggestion="Try: We want to [improve an outcome] for [the people affected] by [addressing today&apos;s challenge]." /></div></div>}
      {step === 2 && <div className="initiative-form-step"><div className="overline">2 · BUSINESS CONTEXT</div><h2>Tell us how this opportunity fits your business.</h2><p className="panel-intro">Short, general answers are enough to start. Skip anything you do not know yet; do not enter confidential, personal, or proprietary information.</p><div className="initiative-form-grid">
        <div className="initiative-question"><label className="initiative-field"><span>Give the initiative a working name <em>Required</em></span><input value={form.name} onChange={updateText("name")} placeholder="e.g. Busy-period planning" /></label><QuestionHelp explanation="A short, recognizable name makes it easier to find this draft later." example="AI-powered restaurant demand forecasting" why="A working name keeps your notes easy to discuss." suggestion="Use a few words that describe the opportunity; it does not need to be final." /></div>
        <div className="initiative-question"><label className="initiative-field"><span>Which business area is involved?</span><input value={form.department} onChange={updateText("department")} placeholder="e.g. Restaurant operations" /></label><QuestionHelp explanation="Name a team or part of the business that understands the process." example="Store operations or workforce planning" why="The right people can explain today&apos;s process and review proposed changes." suggestion="A general team name is enough. Avoid naming individual employees." /></div>
        <div className="initiative-question initiative-question-wide"><label className="initiative-field"><span>Brief initiative description</span><textarea rows={2} value={form.description} onChange={updateText("description")} placeholder="Add a short summary people can use to recognize this plan." /></label></div>
        <div className="initiative-question initiative-question-wide"><label className="initiative-field"><span>What problem are you trying to solve? <em>Required</em></span><textarea rows={3} value={form.challenge} onChange={updateText("challenge")} placeholder="What is difficult, slow, costly, or unpredictable today?" /></label><QuestionHelp explanation="Describe what happens today and where people experience friction." example="Managers may find it difficult to anticipate busy periods and prepare resources." why="Understanding the problem helps the team judge whether the proposed AI use is relevant." suggestion="Mention when the issue happens, who notices it, and what it affects." /></div>
        <div className="initiative-question initiative-question-wide"><label className="initiative-field"><span>How is this handled today?</span><textarea rows={2} value={form.currentProcess} onChange={updateText("currentProcess")} placeholder="Describe the current process, tools, or workarounds." /></label><QuestionHelp explanation="Outline the steps people take now, including any manual checks or workarounds." example="Managers review recent traffic, reservations, and their own experience before planning shifts." why="A future approach needs to fit real work, not just produce a prediction." suggestion="Keep it high level; do not include system credentials or sensitive records." /></div>
        <div className="initiative-question"><label className="initiative-field"><span>Who could be affected?</span><input value={form.peopleImpacted} onChange={updateText("peopleImpacted")} placeholder="e.g. Managers, kitchen and service teams" /></label><QuestionHelp explanation="Think about people who may use the system or feel its effects." example="Restaurant managers, kitchen teams, service staff, and customers" why="Their needs and feedback matter when evaluating changes to a workflow." suggestion="Describe groups or roles, not individual names." /></div>
        <div className="initiative-question"><label className="initiative-field"><span>What might AI help people do?</span><input value={form.intendedUse} onChange={updateText("intendedUse")} placeholder="e.g. Anticipate demand and plan resources" /></label><QuestionHelp explanation="Describe the task AI might support and who would use its output." example="Estimate busy periods so a manager can review staffing and preparation plans." why="A specific intended use makes it easier to identify limits and safeguards." suggestion="Describe AI as supporting a person&apos;s decision, not automatically making it." /></div>
        <div className="initiative-question initiative-question-wide"><label className="initiative-field"><span>What would success look like?</span><textarea rows={2} value={form.successLooksLike} onChange={updateText("successLooksLike")} placeholder="Describe the business benefit you hope to see." /></label><QuestionHelp explanation="Describe the change you would hope to see if the idea works as intended." example="Fewer avoidable waits while keeping customer service quality high." why="Benefits should be considered alongside cost, risk, and effects on people." suggestion="Keep this as a proposed benefit until you have evidence." /></div>
        <div className="initiative-question"><label className="initiative-field"><span>How could you measure improvement?</span><input value={form.successMetric} onChange={updateText("successMetric")} placeholder="e.g. Average wait time" /></label><QuestionHelp explanation="Choose an observable measure linked to your business goal." example="Average wait time, ingredient waste, forecast accuracy, or customer satisfaction" why="A measure helps people compare a future result with a baseline." suggestion="You can add a baseline and target later; do not guess if you do not know them yet." /></div>
        <details className="initiative-optional-measures initiative-question-wide"><summary>Add measurement details if you know them</summary><div className="initiative-form-grid"><label className="initiative-field"><span>Measurement period</span><input value={form.measurementPeriod} onChange={updateText("measurementPeriod")} placeholder="e.g. Weekly" /></label><label className="initiative-field"><span>Baseline, if known</span><input value={form.baseline} onChange={updateText("baseline")} placeholder="Current value or not known" /></label><label className="initiative-field"><span>Possible target, if known</span><input value={form.target} onChange={updateText("target")} placeholder="A proposed future value" /></label><label className="initiative-field"><span>Measurement unit</span><input value={form.unit} onChange={updateText("unit")} placeholder="e.g. minutes" /></label></div></details>
      </div></div>}
      {step === 3 && <div className="initiative-form-step"><div className="overline">3 · PRELIMINARY PLANNING</div><h2>What areas should be considered?</h2><p className="panel-intro">This user-confirmed checklist is a planning aid. It does not select factories, verify evidence, or determine readiness.</p><div className="assessment-area-grid">{assessmentAreas.map((area) => <div className="assessment-area-choice" key={area.id}><label className="assessment-area-option"><input type="checkbox" checked={form.assessmentAreas.includes(area.id)} onChange={() => toggleArea(area.id)} /><span><strong>{area.label}</strong><small>{area.why}</small></span></label><QuestionHelp explanation={area.why} example={area.evidence[0]} why="This is a question for early planning, not an official factory assessment." suggestion="Select this area if you think it may need attention as the idea develops." /></div>)}</div></div>}
      {step === 4 && <div className="initiative-form-step"><div className="overline">4 · REVIEW</div><h2>Review your planning draft.</h2><p className="panel-intro">Confirm the details before saving. Saving keeps a non-sensitive planning copy in this browser; nothing is sent to the backend.</p><div className="initiative-review-grid"><div><span>Initiative</span><strong>{form.name || "Untitled initiative"}</strong></div><div><span>Description</span><strong>{form.description || "Not provided"}</strong></div><div><span>Business area</span><strong>{form.department || "Not provided"}</strong></div><div className="review-wide"><span>Business objective</span><strong>{form.objective || form.goal || "Not provided"}</strong></div><div className="review-wide"><span>Current challenge</span><strong>{form.challenge || "Not provided"}</strong></div><div className="review-wide"><span>How it works today</span><strong>{form.currentProcess || "Not provided"}</strong></div><div><span>People who may be affected</span><strong>{form.peopleImpacted || "Not provided"}</strong></div><div><span>Intended AI use</span><strong>{form.intendedUse || "Not provided"}</strong></div><div><span>Success measure</span><strong>{form.successMetric || "Not yet defined"}</strong></div><div><span>Baseline</span><strong>{form.baseline ? `${form.baseline}${form.unit ? ` ${form.unit}` : ""}` : "Not yet known"}</strong></div><div><span>Possible target</span><strong>{form.target ? `${form.target}${form.unit ? ` ${form.unit}` : ""}` : "Not yet defined"}</strong></div><div><span>Measurement period</span><strong>{form.measurementPeriod || "Not yet defined"}</strong></div><div className="review-wide"><span>Expected benefits and what success could look like</span><strong>{form.successLooksLike || form.expectedBenefit || "Not yet described"}</strong></div></div><div className="initiative-review-areas"><strong>Areas to consider</strong>{form.assessmentAreas.length ? <div>{form.assessmentAreas.map((id) => <span className="initiative-area-chip" key={id}>{assessmentAreas.find((area) => area.id === id)?.label}</span>)}</div> : <span>No areas selected yet. You can go back to choose planning questions that fit your initiative.</span>}</div><div className="initiative-review-areas"><strong>Potential information to gather</strong>{form.assessmentAreas.length ? <ul>{form.assessmentAreas.flatMap((id) => assessmentAreas.find((area) => area.id === id)?.evidence ?? []).map((item) => <li key={item}>{item}</li>)}</ul> : <span>Choose relevant areas to see examples of information to consider.</span>}</div><div className="initiative-review-areas"><strong>Information to follow up</strong>{missingReviewItems.length ? <ul>{missingReviewItems.map((item) => <li key={item}>{item}</li>)}</ul> : <span>You have captured a starting point for each core planning question.</span>}</div><div className="initiative-review-areas"><strong>A useful next planning step</strong><span>Confirm the baseline, measurement source, and review owner with the people responsible for this process.</span><QuestionHelp explanation="Your answers are an initial planning snapshot. Some details may need follow-up with people who know the work." example="Confirm how wait time is measured today and who can review an appropriate pilot." why="Naming the unknowns helps keep the next conversation practical." suggestion="Choose one question to validate before selecting a tool or making an implementation decision." /></div></div>}
      <div className="initiative-form-actions">{step > 1 && <button className="button button-outline" type="button" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={14} aria-hidden="true" />Previous</button>}{step < 4 ? <button className="button button-dark" type="button" disabled={!canContinue || !canReview} onClick={() => setStep((value) => value + 1)}>Continue <ArrowRight size={14} aria-hidden="true" /></button> : <button className="button button-dark" type="button" onClick={save}><Save size={14} aria-hidden="true" />Save local draft</button>}</div>
    </section>
    <p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />Draft data is stored only in this browser. Do not store confidential company documents, proprietary evidence, credentials, or personal information here.</p>
  </div>

  if (screen === "draft" && selectedDraft) return <div className="page-stack initiative-page">
    <div className="business-page-heading"><div><div className="overline">{selectedDraft.source === "illustrative" ? "FICTIONAL EXAMPLE SANDBOX" : "LOCAL PLANNING DRAFT"}</div><h1>{selectedDraft.name}</h1><p className="page-subtitle">{selectedDraft.objective || selectedDraft.goal || "Business objective not yet described."}</p></div><div className="initiative-heading-actions"><button className="button button-outline" onClick={() => exportDraft(selectedDraft)}><Download size={14} aria-hidden="true" />Export JSON</button><button className="button button-outline" onClick={() => beginDraft(selectedDraft)}>Edit draft</button><button className="button button-outline" onClick={() => { selectInitiative(null); setScreen("home") }}><ArrowLeft size={14} aria-hidden="true" />All initiatives</button></div></div>
    {savedMessage && <div className="initiative-saved-message" role="status"><Check size={15} aria-hidden="true" />{savedMessage}</div>}
    <section className="panel initiative-detail-panel"><div className="panel-heading"><div><div className="overline">BUSINESS CONTEXT</div><h2>{selectedDraft.description || "Your planning summary"}</h2></div><span className="local-data-badge">{selectedDraft.source === "illustrative" ? "ILLUSTRATIVE · NOT VERIFIED" : "LOCAL · NOT VERIFIED"}</span></div><div className="initiative-review-grid"><div><span>Business area</span><strong>{selectedDraft.department || "Not provided"}</strong></div><div><span>Current challenge</span><strong>{selectedDraft.challenge || "Not provided"}</strong></div><div className="review-wide"><span>Intended AI use</span><strong>{selectedDraft.intendedUse || "Not provided"}</strong></div><div><span>Readiness questions</span><strong>{Object.values(selectedDraft.readinessAnswers).filter((answer) => answer.trim()).length} answered</strong></div><div><span>KPIs</span><strong>{selectedDraft.kpis.length} defined</strong></div><div><span>Open actions</span><strong>{selectedDraft.actions.filter((action) => action.status !== "completed").length}</strong></div><div><span>Evidence items</span><strong>{selectedDraft.evidence.length} tracked</strong></div></div><p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />Planning information is stored in this browser. It is not an assessment, verified evidence, or authorization to act.</p></section>
    <section className="section-block"><div className="section-heading"><div><div className="overline">CONTINUE PLANNING</div><h2>Choose a workspace</h2></div></div><div className="initiative-workspace-link-grid"><button className="button button-outline" onClick={() => onNavigate("readiness")}>Readiness questions <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("performance")}>KPIs &amp; outcomes <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("people")}>People &amp; skills <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("decision")}>Actions &amp; milestones <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("evidence")}>Evidence checklist <ArrowRight size={14} aria-hidden="true" /></button></div></section>
  </div>

  return <div className="page-stack initiative-page">
    <div className="business-page-heading"><div><div className="overline">AI INITIATIVES</div><h1>Plan an AI opportunity.</h1><p className="page-subtitle">Start with the business outcome, then organize the questions and evidence that deserve review.</p></div><button className="button button-dark" onClick={() => beginDraft()}><Plus size={15} aria-hidden="true" />Start an AI initiative</button></div>
    <div className="initiative-path-grid"><article className="panel initiative-path-card"><span className="initiative-path-icon"><Plus size={20} aria-hidden="true" /></span><div className="overline">YOUR BUSINESS GOAL</div><h2>Start an AI initiative</h2><p>Describe an opportunity, capture business context, choose preliminary assessment areas, and save a local planning draft.</p><button className="button button-dark" onClick={() => beginDraft()}>Start planning <ArrowRight size={14} aria-hidden="true" /></button></article><article className="panel initiative-path-card example"><span className="initiative-path-icon"><ClipboardCheck size={20} aria-hidden="true" /></span><div className="overline">FICTIONAL EDUCATIONAL EXAMPLE</div><h2>The Cheesecake Factory — Demo Scenario</h2><p>Explore a guided, fictional restaurant demand forecasting scenario. No company data, assessments, or outcomes are represented.</p><button className="button button-outline" onClick={() => onNavigate("example")}>Explore example <ArrowRight size={14} aria-hidden="true" /></button></article></div>
    <section className="section-block"><div className="section-heading"><div><div className="overline">SAVED IN THIS BROWSER</div><h2>Your initiative drafts</h2></div><span className="local-data-badge">LOCAL ONLY</span></div>
      {!loaded ? <div className="panel initiative-empty"><p>Loading locally saved drafts…</p></div> : drafts.length === 0 ? <div className="panel initiative-empty"><span className="initiative-path-icon"><FileText size={18} aria-hidden="true" /></span><div><h3>No drafts yet</h3><p>Your new draft will be available in this browser after you save it. Drafts are not sent to COMRADII services.</p></div><button className="button button-outline" onClick={() => beginDraft()}>Create the first draft <ArrowRight size={14} aria-hidden="true" /></button></div> : <div className="initiative-draft-list">{drafts.map((draft) => <article className={`panel initiative-draft-card ${selectedId === draft.id ? "selected" : ""}`} key={draft.id}><div className="initiative-draft-main"><span className="local-data-badge">LOCAL DRAFT</span><h3>{draft.name}</h3><p>{draft.objective || draft.goal || "Objective not yet described."}</p><small>{draft.department || "Business area not provided"} · Updated {new Date(draft.updatedAt).toLocaleDateString()}</small></div><div className="initiative-draft-actions"><button className="button button-dark" onClick={() => { selectInitiative(draft.id); setScreen("draft") }}>{selectedId === draft.id ? "Open workspace" : "Open draft"}<ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => beginDraft(draft)}>Edit</button><button className="icon-button" onClick={() => confirmDelete(draft)} aria-label={`Delete ${draft.name}`}><Trash2 size={15} aria-hidden="true" /></button></div></article>)}</div>}
    </section>
    <div className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" /><span>Local planning drafts are not submitted to, verified by, or synchronized with the COMRADII backend. Store only non-sensitive planning information—never confidential documents, proprietary evidence, credentials, or personal information.</span></div>
  </div>
}

function QuestionHelp({ title = "Need help answering this?", explanation, example, why, suggestion }: { title?: string; explanation: string; example: string; why: string; suggestion: string }) {
  return <details className="question-help"><summary><CircleHelp size={13} aria-hidden="true" />{title}</summary><div className="question-help-content"><p><strong>What it means</strong>{explanation}</p><p><strong>Example</strong>{example}</p><p><strong>Why it matters</strong>{why}</p><p><strong>A useful answer could include</strong>{suggestion}</p><span className="question-help-note">Predefined planning guidance · No AI assistant is connected here.</span></div></details>
}
