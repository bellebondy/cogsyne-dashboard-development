"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, CircleHelp, Save } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

export function PlanningDecisionPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const { selectedDraft, updateDraft, selectInitiative } = useInitiativeWorkspace()
  const [note, setNote] = useState(selectedDraft?.decisionNote ?? "")
  const [nextStep, setNextStep] = useState(selectedDraft?.nextStep ?? "")
  const [saved, setSaved] = useState(false)

  if (!selectedDraft) return <div className="page-stack"><div className="business-page-heading"><div><div className="overline">DECISIONS &amp; ACTIONS</div><h1>Keep people in control.</h1><p className="page-subtitle">Planning notes are available for your own local drafts. Demonstrations do not contain completed or approved business decisions.</p></div></div><section className="panel initiative-empty"><span className="initiative-path-icon"><CircleHelp size={18} aria-hidden="true" /></span><div><h3>No local initiative selected</h3><p>Open one of your local initiative drafts to record a proposed next step. The fictional restaurant walkthrough is separate from the technical API demo.</p></div><button className="button button-dark" onClick={() => onNavigate("F4")}>View initiatives <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("example")}>Explore restaurant illustration <ArrowRight size={14} aria-hidden="true" /></button></section></div>

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateDraft({ ...selectedDraft, decisionNote: note, nextStep })
    setSaved(true)
  }

  return <div className="page-stack">
    <div className="business-page-heading"><div><div className="overline">DECISIONS &amp; ACTIONS · LOCAL PLANNING</div><h1>Record a proposed next step.</h1><p className="page-subtitle">Capture questions and options for discussion. This note is not an approval or authorization to act.</p></div><span className="local-data-badge">LOCAL DRAFT</span></div>
    <section className="panel initiative-detail-panel"><div className="panel-heading"><div><div className="overline">ISSUE FOR CONSIDERATION</div><h2>{selectedDraft.name}</h2></div></div><p className="panel-intro">{selectedDraft.challenge || "No current challenge has been described in this draft."}</p><div className="decision-planning-prompts"><div><strong>Why it may matter</strong><p>{selectedDraft.expectedBenefit || "Expected benefit has not been defined."}</p></div><div><strong>What evidence could help</strong><p>Review the initiative&apos;s planned assessment areas and identify relevant information before making a decision.</p></div></div></section>
    <section className="panel initiative-detail-panel"><div className="panel-heading"><div><div className="overline">PLANNING NOTE</div><h2>What should happen next?</h2></div><span className="local-data-badge">NOT AN APPROVAL</span></div><form className="initiative-notes-form" onSubmit={save}><label className="initiative-field"><span>Options, questions, or trade-offs</span><textarea rows={4} value={note} onChange={(event) => { setNote(event.target.value); setSaved(false) }} placeholder="For example, compare a small pilot with maintaining the current process while gathering more evidence." /></label><label className="initiative-field"><span>Proposed next step</span><input value={nextStep} onChange={(event) => { setNextStep(event.target.value); setSaved(false) }} placeholder="e.g. Ask a process owner to confirm the baseline measurement" /></label><div className="initiative-form-actions"><button className="button button-dark" type="submit"><Save size={14} aria-hidden="true" />Save local planning note</button>{saved && <span role="status" className="local-save-status">Saved in this browser only.</span>}</div></form><p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />This action records a local draft note only. It does not authorize spending, hiring, deployment, or other business action.</p></section>
    <div className="initiative-detail-actions"><button className="text-button" onClick={() => onNavigate("readiness")}>Review missing information <ArrowRight size={14} aria-hidden="true" /></button><button className="text-button" onClick={() => onNavigate("F6")}>Review performance measures <ArrowRight size={14} aria-hidden="true" /></button></div>
  </div>
}
