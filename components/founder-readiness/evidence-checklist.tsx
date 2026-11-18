"use client"

import { useState, type FormEvent } from "react"
import { CircleHelp, Plus, Save, Trash2, X } from "lucide-react"
import type { EvidenceCategory, EvidenceStatus, PlanningEvidenceItem } from "@/lib/planning-model"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

const categoryOptions: { value: EvidenceCategory; label: string }[] = [
  { value: "business", label: "Business requirements" },
  { value: "process", label: "Current process" },
  { value: "data", label: "Data availability and quality" },
  { value: "risk", label: "Risk review" },
  { value: "testing", label: "Testing plan" },
  { value: "acceptance", label: "Acceptance criteria" },
  { value: "stakeholder", label: "Stakeholder review" },
  { value: "outcomes", label: "Outcome measurements" },
  { value: "other", label: "Other information" },
]
const emptyEvidence = { title: "", description: "", category: "business" as EvidenceCategory, requestedOwner: "", status: "not-requested" as EvidenceStatus, notes: "", reference: "" }

export function EvidenceChecklist() {
  const { selectedDraft, updateDraft } = useInitiativeWorkspace()
  const [form, setForm] = useState(emptyEvidence)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!selectedDraft) return <section className="panel evidence-planning-panel"><div className="panel-heading"><div><div className="overline">LOCAL PLANNING CHECKLIST</div><h2>Choose an initiative to track information.</h2></div></div><p className="panel-intro">Checklist items, notes, and references stay with their initiative in this browser. No file upload or secure document storage is available here.</p></section>

  const resetForm = () => { setForm(emptyEvidence); setEditingId(null) }
  const saveItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const existing = editingId ? selectedDraft.evidence.find((item) => item.id === editingId) : undefined
    const item: PlanningEvidenceItem = { ...form, id: existing?.id ?? crypto.randomUUID(), title: form.title.trim(), description: form.description.trim(), requestedOwner: form.requestedOwner.trim(), notes: form.notes.trim(), reference: form.reference.trim() }
    updateDraft({ ...selectedDraft, evidence: existing ? selectedDraft.evidence.map((current) => current.id === existing.id ? item : current) : [...selectedDraft.evidence, item] }, `${existing ? "Updated" : "Added"} evidence checklist item: ${item.title}`)
    resetForm()
  }
  const editItem = (item: PlanningEvidenceItem) => { setEditingId(item.id); setForm({ title: item.title, description: item.description, category: item.category, requestedOwner: item.requestedOwner, status: item.status, notes: item.notes, reference: item.reference }) }
  const setStatus = (item: PlanningEvidenceItem, status: EvidenceStatus) => updateDraft({ ...selectedDraft, evidence: selectedDraft.evidence.map((current) => current.id === item.id ? { ...current, status } : current) }, `Updated evidence status: ${item.title}`)
  const deleteItem = (item: PlanningEvidenceItem) => {
    if (!window.confirm(`Remove “${item.title}” from this local checklist?`)) return
    updateDraft({ ...selectedDraft, evidence: selectedDraft.evidence.filter((current) => current.id !== item.id) }, `Removed evidence checklist item: ${item.title}`)
    if (editingId === item.id) resetForm()
  }

  return <div className="evidence-planning-workspace">
    <section className="panel planning-form-panel"><div className="panel-heading"><div><div className="overline">{editingId ? "EDIT CHECKLIST ITEM" : "EVIDENCE & INFORMATION PLANNING"}</div><h2>{editingId ? "Update an information request" : "Add an evidence checklist item"}</h2></div>{editingId && <button type="button" className="icon-button" onClick={resetForm} aria-label="Cancel evidence editing"><X size={16} aria-hidden="true" /></button>}</div>
      <p className="panel-intro">Track metadata, notes, and optional references. Do not upload confidential documents or treat user-provided information as verified.</p>
      <form className="planning-form-grid" onSubmit={saveItem}>
        <label className="initiative-field"><span>Title <em>Required</em></span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Current process documentation" /></label>
        <label className="initiative-field"><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as EvidenceCategory })}>{categoryOptions.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></label>
        <label className="initiative-field planning-field-wide"><span>Description</span><textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What information or evidence should be gathered?" /></label>
        <label className="initiative-field"><span>Requested owner</span><input value={form.requestedOwner} onChange={(event) => setForm({ ...form, requestedOwner: event.target.value })} placeholder="Role or team" /></label>
        <label className="initiative-field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as EvidenceStatus })}><option value="not-requested">Not requested</option><option value="requested">Requested</option><option value="provided-by-user">Provided by user</option><option value="needs-review">Needs review</option></select></label>
        <label className="initiative-field planning-field-wide"><span>Notes</span><textarea rows={2} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add context or gaps to follow up." /></label>
        <label className="initiative-field planning-field-wide"><span>Optional reference or link</span><input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="A document name or URL; no file is uploaded" /></label>
        <div className="planning-form-actions planning-field-wide"><button className="button button-dark" type="submit"><Save size={14} aria-hidden="true" />{editingId ? "Save checklist item" : "Add checklist item"}</button></div>
      </form>
    </section>

    <section className="panel evidence-checklist-list"><div className="panel-heading"><div><div className="overline">{selectedDraft.name}</div><h2>Information to gather</h2></div><span className="local-data-badge">{selectedDraft.evidence.length} ITEMS · LOCAL ONLY</span></div>
      {selectedDraft.evidence.length === 0 ? <div className="initiative-empty"><CircleHelp size={18} aria-hidden="true" /><p>Add business requirements, process notes, data-quality questions, risk reviews, testing plans, acceptance criteria, or outcome measures.</p></div> : <div className="planning-item-list">{selectedDraft.evidence.map((item) => <article className="planning-list-item" key={item.id}>
        <div><div className="action-card-tags"><span className={`planning-area-state ${item.status === "provided-by-user" ? "complete" : item.status === "needs-review" ? "in-progress" : "not-started"}`}>{evidenceStatus(item.status)}</span><span className="evidence-category-label">{categoryOptions.find((category) => category.value === item.category)?.label}</span></div><h3>{item.title}</h3><p>{item.description || "No description provided."}</p><small>{item.requestedOwner ? `Requested owner: ${item.requestedOwner}` : "No requested owner"}</small>{item.notes && <p className="evidence-item-notes">{item.notes}</p>}{item.reference && <p className="evidence-item-reference">Reference: {item.reference}</p>}</div>
        <div className="planning-item-actions"><label className="sr-only" htmlFor={`evidence-status-${item.id}`}>Evidence status for {item.title}</label><select id={`evidence-status-${item.id}`} value={item.status} onChange={(event) => setStatus(item, event.target.value as EvidenceStatus)}><option value="not-requested">Not requested</option><option value="requested">Requested</option><option value="provided-by-user">Provided by user</option><option value="needs-review">Needs review</option></select><button className="button button-outline" onClick={() => editItem(item)}>Edit</button><button className="icon-button" onClick={() => deleteItem(item)} aria-label={`Delete evidence item ${item.title}`}><Trash2 size={15} aria-hidden="true" /></button></div>
      </article>)}</div>}
    </section>
    {selectedDraft.activity.length > 0 && <section className="panel local-planning-activity"><div className="panel-heading"><div><div className="overline">BROWSER-LOCAL PLANNING ACTIVITY</div><h2>Recent updates</h2></div><span className="mini-label">NOT BACKEND EVENTS</span></div><div className="planning-activity-list">{[...selectedDraft.activity].reverse().slice(0, 8).map((entry) => <article key={entry.id}><span className="planning-activity-dot" /><div><strong>{entry.summary}</strong><time dateTime={entry.occurredAt}>{formatActivityDate(entry.occurredAt)}</time></div></article>)}</div></section>}
    <p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />“Provided by user” means information was entered into this local checklist; it does not mean the information was verified. This workspace stores notes and references only, not files.</p>
  </div>
}

function evidenceStatus(status: EvidenceStatus) {
  return { "not-requested": "Not requested", requested: "Requested", "provided-by-user": "Provided by user · not verified", "needs-review": "Needs review" }[status]
}

function formatActivityDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Time unavailable" : date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}
