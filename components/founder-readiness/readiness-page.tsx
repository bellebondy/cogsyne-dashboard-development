"use client"

import { ArrowRight, CircleHelp, ShieldCheck } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import { assessmentAreas, getReadinessSnapshot, readinessQuestions } from "@/lib/planning-model"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

export function ReadinessPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const { selectedDraft, updateDraft } = useInitiativeWorkspace()

  if (!selectedDraft) return (
    <div className="page-stack">
      <div className="business-page-heading"><div><div className="overline">READINESS PLANNING</div><h1>Start with the questions that matter.</h1><p className="page-subtitle">Use plain-language prompts to organize what is known, what needs discussion, and what information to gather next.</p></div></div>
      <section className="panel initiative-empty"><span className="initiative-path-icon"><CircleHelp size={18} aria-hidden="true" /></span><div><h2>Select or create an initiative</h2><p>Your answers are saved locally to the selected plan. They are planning notes—not a readiness verdict or factory assessment.</p></div><button className="button button-dark" onClick={() => onNavigate("F4")}>Start an initiative <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("example")}>Explore the fictional example</button></section>
    </div>
  )

  const snapshot = getReadinessSnapshot(selectedDraft)
  const answer = (questionId: string, value: string) => updateDraft({ ...selectedDraft, readinessAnswers: { ...selectedDraft.readinessAnswers, [questionId]: value } })
  const note = (questionId: string, value: string) => updateDraft({ ...selectedDraft, readinessNotes: { ...selectedDraft.readinessNotes, [questionId]: value } })

  return (
    <div className="page-stack readiness-workspace">
      <div className="business-page-heading"><div><div className="overline">READINESS &amp; ASSURANCE · {selectedDraft.source === "illustrative" ? "FICTIONAL SANDBOX" : "LOCAL PLANNING"}</div><h1>Organize your readiness questions.</h1><p className="page-subtitle">Work through six practical areas. Your answers are saved to <strong>{selectedDraft.name}</strong> in this browser and can be revisited at any time.</p></div></div>

      <section className="panel readiness-snapshot-panel" aria-labelledby="readiness-snapshot-title">
        <div className="panel-heading"><div><div className="overline">PLANNING PROGRESS · NOT AN ASSURANCE RESULT</div><h2 id="readiness-snapshot-title">Your AI Readiness Planning Snapshot</h2></div><span className="readiness-status-icon simulated"><ShieldCheck size={18} aria-hidden="true" /></span></div>
        <p className="panel-intro">Planning completion reflects information provided and does not represent verified organizational readiness.</p>
        <div className="planning-snapshot-metrics">
          <div><strong>{snapshot.answered} / {snapshot.total}</strong><span>Questions answered</span></div>
          <div><strong>{snapshot.areasReviewed} / {assessmentAreas.length}</strong><span>Areas reviewed</span></div>
          <div><strong>{snapshot.completion}%</strong><span>Planning completion</span></div>
          <div><strong>{snapshot.gaps}</strong><span>Information gaps</span></div>
        </div>
        <div className="planning-progress-track" role="progressbar" aria-label="Readiness planning completion" aria-valuenow={snapshot.completion} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${snapshot.completion}%` }} /></div>
        <div className="readiness-snapshot-foot"><span>{snapshot.areasComplete} areas have all their planning questions answered.</span><span>{snapshot.areasNeedingReview.length ? `Further review: ${snapshot.areasNeedingReview.join(", ")}` : "All questionnaire prompts have a response; this does not verify the information."}</span></div>
        {snapshot.answered === 0 && <div className="readiness-start-note"><CircleHelp size={16} aria-hidden="true" /><span>Start with the questions you can answer today. It is fine to write “not known yet” and create an action to follow up.</span></div>}
      </section>

      <div className="readiness-questionnaire-heading"><div><div className="overline">GUIDED QUESTIONNAIRE</div><h2>{selectedDraft.name}</h2></div><span className="local-data-badge">SAVED IN THIS BROWSER</span></div>
      <div className="readiness-questionnaire-grid">
        {assessmentAreas.map((area) => {
          const questions = readinessQuestions.filter((item) => item.areaId === area.id)
          const answered = questions.filter((item) => Boolean(selectedDraft.readinessAnswers[item.id]?.trim())).length
          const complete = answered === questions.length
          return <section className="panel readiness-question-card" key={area.id}>
            <div className="readiness-question-card-heading"><div><span className="overline">PLANNING AREA</span><h3>{area.label}</h3></div><span className={`planning-area-state ${complete ? "complete" : answered ? "in-progress" : "not-started"}`}>{complete ? "Reviewed" : answered ? "In progress" : "Not started"}</span></div>
            <p className="readiness-question-area-help">{area.why}</p>
            <div className="readiness-question-list">{questions.map((question, index) => {
              const controlId = `answer-${question.id}`
              const noteId = `note-${question.id}`
              return <div className="readiness-question" key={question.id}>
                <label className="initiative-field" htmlFor={controlId}><span><b>{index + 1}.</b> {question.prompt}</span>
                  {question.input === "select" ? <select id={controlId} value={selectedDraft.readinessAnswers[question.id] ?? ""} onChange={(event) => answer(question.id, event.target.value)}><option value="">Choose an answer</option>{question.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <textarea id={controlId} rows={3} value={selectedDraft.readinessAnswers[question.id] ?? ""} onChange={(event) => answer(question.id, event.target.value)} placeholder="Add a short planning note, or write ‘not known yet’." />}
                </label>
                <details className="question-help"><summary><CircleHelp size={13} aria-hidden="true" />Help and example</summary><div className="question-help-content"><p><strong>Why this is useful</strong>{question.help}</p><p><strong>Example</strong>{question.example}</p><span className="question-help-note">Use a high-level description. Do not include credentials, confidential records, or personal information.</span></div></details>
                <label className="initiative-field readiness-question-note" htmlFor={noteId}><span>Optional note</span><input id={noteId} value={selectedDraft.readinessNotes[question.id] ?? ""} onChange={(event) => note(question.id, event.target.value)} placeholder="Source, follow-up, or context to remember" /></label>
              </div>
            })}</div>
          </section>
        })}
      </div>

      <section className="panel future-assurance-placeholder"><div className="panel-heading"><div><div className="overline">FUTURE VERIFIED FINDINGS</div><h2>Factory assessments are not connected here.</h2></div><span className="local-data-badge">NOT AVAILABLE</span></div><p>Future integrations may display results from F3 Product Assurance and F9 Assurance Intelligence with their source, status, and provenance. No factory result, verified evidence, or organizational score is represented by this planning snapshot.</p></section>
    </div>
  )
}
