"use client"

import { useMemo, useState, type FormEvent } from "react"
import { ArrowRight, CircleHelp, Plus, Save, Trash2, X } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import { assessmentAreas, type PlanningAction, type PlanningActionPriority, type PlanningActionStatus, type PlanningMilestone } from "@/lib/planning-model"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

type ActionForm = { title: string; description: string; priority: PlanningActionPriority; owner: string; dueDate: string; status: PlanningActionStatus; readinessArea: string; evidenceItemId: string }
type MilestoneForm = { title: string; description: string; dueDate: string; owner: string; status: PlanningMilestone["status"] }
const emptyAction: ActionForm = { title: "", description: "", priority: "medium", owner: "", dueDate: "", status: "todo", readinessArea: "", evidenceItemId: "" }
const emptyMilestone: MilestoneForm = { title: "", description: "", dueDate: "", owner: "", status: "planned" }

export function PlanningDecisionPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const { selectedDraft, updateDraft } = useInitiativeWorkspace()
  const [form, setForm] = useState<ActionForm>(emptyAction)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [milestoneForm, setMilestoneForm] = useState<MilestoneForm>(emptyMilestone)
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [ownerFilter, setOwnerFilter] = useState("all")
  const [note, setNote] = useState(selectedDraft?.decisionNote ?? "")
  const [nextStep, setNextStep] = useState(selectedDraft?.nextStep ?? "")
  const filteredActions = useMemo(() => (selectedDraft?.actions ?? []).filter((action) => (statusFilter === "all" || action.status === statusFilter) && (priorityFilter === "all" || action.priority === priorityFilter) && (ownerFilter === "all" || action.owner === ownerFilter)).sort((left, right) => (left.dueDate || "9999").localeCompare(right.dueDate || "9999")), [ownerFilter, priorityFilter, selectedDraft?.actions, statusFilter])

  if (!selectedDraft) return <div className="page-stack"><div className="business-page-heading"><div><div className="overline">DECISIONS &amp; ACTIONS</div><h1>Turn planning gaps into follow-ups.</h1><p className="page-subtitle">Create local tasks and milestones to organize the work. Completing an item does not approve a business or deployment decision.</p></div></div><section className="panel initiative-empty"><span className="initiative-path-icon"><CircleHelp size={18} aria-hidden="true" /></span><div><h2>Select or create an initiative</h2><p>Each action stays with its initiative and is separate from authorized human dispositions in the factory backend.</p></div><button className="button button-dark" onClick={() => onNavigate("F4")}>Start an initiative <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("example")}>Explore the fictional example</button></section></div>

  const resetActionForm = () => { setForm(emptyAction); setEditingId(null) }
  const saveAction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const existing = editingId ? selectedDraft.actions.find((action) => action.id === editingId) : undefined
    const action: PlanningAction = { id: existing?.id ?? crypto.randomUUID(), title: form.title.trim(), description: form.description.trim(), priority: form.priority, owner: form.owner.trim(), dueDate: form.dueDate, status: form.status, readinessArea: form.readinessArea ? form.readinessArea as PlanningAction["readinessArea"] : undefined, evidenceItemId: form.evidenceItemId || undefined }
    updateDraft({ ...selectedDraft, actions: existing ? selectedDraft.actions.map((item) => item.id === existing.id ? action : item) : [...selectedDraft.actions, action] }, `${existing ? "Updated" : "Added"} planning action: ${action.title}`)
    resetActionForm()
  }
  const editAction = (action: PlanningAction) => { setEditingId(action.id); setForm({ title: action.title, description: action.description, priority: action.priority, owner: action.owner, dueDate: action.dueDate, status: action.status, readinessArea: action.readinessArea ?? "", evidenceItemId: action.evidenceItemId ?? "" }) }
  const setActionStatus = (action: PlanningAction, status: PlanningActionStatus) => updateDraft({ ...selectedDraft, actions: selectedDraft.actions.map((item) => item.id === action.id ? { ...item, status } : item) }, `${status === "completed" ? "Completed" : "Updated"} planning action: ${action.title}`)
  const deleteAction = (action: PlanningAction) => {
    if (!window.confirm(`Delete “${action.title}” from this local action list?`)) return
    updateDraft({ ...selectedDraft, actions: selectedDraft.actions.filter((item) => item.id !== action.id) }, `Deleted planning action: ${action.title}`)
    if (editingId === action.id) resetActionForm()
  }

  const resetMilestoneForm = () => { setMilestoneForm(emptyMilestone); setEditingMilestoneId(null) }
  const saveMilestone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const existing = editingMilestoneId ? selectedDraft.milestones.find((milestone) => milestone.id === editingMilestoneId) : undefined
    const milestone: PlanningMilestone = { id: existing?.id ?? crypto.randomUUID(), title: milestoneForm.title.trim(), description: milestoneForm.description.trim(), dueDate: milestoneForm.dueDate, owner: milestoneForm.owner.trim(), status: milestoneForm.status }
    updateDraft({ ...selectedDraft, milestones: existing ? selectedDraft.milestones.map((item) => item.id === existing.id ? milestone : item) : [...selectedDraft.milestones, milestone] }, `${existing ? "Updated" : "Added"} milestone: ${milestone.title}`)
    resetMilestoneForm()
  }
  const editMilestone = (milestone: PlanningMilestone) => { setEditingMilestoneId(milestone.id); setMilestoneForm({ title: milestone.title, description: milestone.description, dueDate: milestone.dueDate, owner: milestone.owner, status: milestone.status }) }
  const deleteMilestone = (milestone: PlanningMilestone) => {
    if (!window.confirm(`Delete milestone “${milestone.title}”?`)) return
    updateDraft({ ...selectedDraft, milestones: selectedDraft.milestones.filter((item) => item.id !== milestone.id) }, `Deleted milestone: ${milestone.title}`)
    if (editingMilestoneId === milestone.id) resetMilestoneForm()
  }

  const owners = [...new Set(selectedDraft.actions.map((action) => action.owner).filter(Boolean))]
  const openActionCount = selectedDraft.actions.filter((action) => action.status !== "completed").length

  return <div className="page-stack planning-feature-page">
    <div className="business-page-heading"><div><div className="overline">DECISIONS &amp; ACTIONS · LOCAL PLANNING</div><h1>Make next steps visible.</h1><p className="page-subtitle">Track proposed planning tasks for <strong>{selectedDraft.name}</strong>. These are not authorized human dispositions or approvals to deploy, hire, spend, or execute.</p></div><span className="local-data-badge">{openActionCount} OPEN ACTIONS</span></div>
    <section className="panel planning-form-panel"><div className="panel-heading"><div><div className="overline">{editingId ? "EDIT ACTION" : "PLANNING ACTION"}</div><h2>{editingId ? "Update a follow-up" : "Add an action"}</h2></div>{editingId && <button type="button" className="icon-button" onClick={resetActionForm} aria-label="Cancel action editing"><X size={16} aria-hidden="true" /></button>}</div>
      <form className="planning-form-grid" onSubmit={saveAction}>
        <label className="initiative-field planning-field-wide"><span>Task title <em>Required</em></span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Confirm who owns the current process documentation" /></label>
        <label className="initiative-field planning-field-wide"><span>Description</span><textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Add context or what completion should produce." /></label>
        <label className="initiative-field"><span>Priority</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as PlanningActionPriority })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
        <label className="initiative-field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PlanningActionStatus })}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="waiting">Waiting for information</option><option value="completed">Completed</option></select></label>
        <label className="initiative-field"><span>Owner</span><input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Role or team" /></label>
        <label className="initiative-field"><span>Due date</span><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
        <label className="initiative-field"><span>Related readiness area</span><select value={form.readinessArea} onChange={(event) => setForm({ ...form, readinessArea: event.target.value })}><option value="">None selected</option>{assessmentAreas.map((area) => <option key={area.id} value={area.id}>{area.label}</option>)}</select></label>
        <label className="initiative-field"><span>Related evidence item</span><select value={form.evidenceItemId} onChange={(event) => setForm({ ...form, evidenceItemId: event.target.value })}><option value="">None selected</option>{selectedDraft.evidence.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <div className="planning-form-actions planning-field-wide"><button className="button button-dark" type="submit"><Save size={14} aria-hidden="true" />{editingId ? "Save action" : "Add action"}</button></div>
      </form>
    </section>

    <section className="section-block"><div className="section-heading"><div><div className="overline">ACTION TRACKER</div><h2>{selectedDraft.actions.length ? `${selectedDraft.actions.length} planning actions` : "No actions yet"}</h2></div><span className="local-data-badge">LOCAL ONLY</span></div>
      <div className="planning-filter-row"><label className="initiative-field"><span>Filter by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="waiting">Waiting for information</option><option value="completed">Completed</option></select></label><label className="initiative-field"><span>Filter by priority</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label className="initiative-field"><span>Filter by owner</span><select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}><option value="all">All owners</option>{owners.map((owner) => <option key={owner} value={owner}>{owner}</option>)}</select></label></div>
      {filteredActions.length === 0 ? <div className="panel initiative-empty"><CircleHelp size={18} aria-hidden="true" /><p>{selectedDraft.actions.length ? "No actions match the selected filters." : "Add a planning follow-up to make an information gap or decision point actionable."}</p></div> : <div className="planning-item-list">{filteredActions.map((action) => <article className={`panel action-card ${action.status === "completed" ? "is-completed" : ""}`} key={action.id}>
        <div className="action-card-main"><div className="action-card-tags"><span className={`planning-area-state ${action.status === "completed" ? "complete" : action.status === "waiting" ? "in-progress" : "not-started"}`}>{actionStatus(action.status)}</span><span className={`action-priority ${action.priority}`}>{action.priority} priority</span></div><h3>{action.title}</h3><p>{action.description || "No description provided."}</p><div className="action-meta"><span>{action.owner || "No owner"}</span><span>{action.dueDate ? `Due ${formatDate(action.dueDate)}` : "No due date"}</span>{action.readinessArea && <span>{assessmentAreas.find((area) => area.id === action.readinessArea)?.label}</span>}{action.evidenceItemId && <span>{selectedDraft.evidence.find((item) => item.id === action.evidenceItemId)?.title ?? "Related evidence"}</span>}</div></div>
        <div className="planning-item-actions"><label className="sr-only" htmlFor={`action-status-${action.id}`}>Status for {action.title}</label><select id={`action-status-${action.id}`} value={action.status} onChange={(event) => setActionStatus(action, event.target.value as PlanningActionStatus)}><option value="todo">To do</option><option value="in-progress">In progress</option><option value="waiting">Waiting for information</option><option value="completed">Completed</option></select><button className="button button-outline" onClick={() => editAction(action)}>Edit</button><button className="icon-button" onClick={() => deleteAction(action)} aria-label={`Delete action ${action.title}`}><Trash2 size={15} aria-hidden="true" /></button></div>
      </article>)}</div>}
    </section>

    <section className="panel planning-form-panel"><div className="panel-heading"><div><div className="overline">PLANNING MILESTONES</div><h2>{editingMilestoneId ? "Edit milestone" : "Add a milestone"}</h2></div>{editingMilestoneId && <button type="button" className="icon-button" onClick={resetMilestoneForm} aria-label="Cancel milestone editing"><X size={16} aria-hidden="true" /></button>}</div>
      <form className="planning-form-grid" onSubmit={saveMilestone}><label className="initiative-field"><span>Milestone <em>Required</em></span><input required value={milestoneForm.title} onChange={(event) => setMilestoneForm({ ...milestoneForm, title: event.target.value })} placeholder="e.g. Review the current process" /></label><label className="initiative-field"><span>Target date</span><input type="date" value={milestoneForm.dueDate} onChange={(event) => setMilestoneForm({ ...milestoneForm, dueDate: event.target.value })} /></label><label className="initiative-field"><span>Owner</span><input value={milestoneForm.owner} onChange={(event) => setMilestoneForm({ ...milestoneForm, owner: event.target.value })} placeholder="Role or team" /></label><label className="initiative-field"><span>Status</span><select value={milestoneForm.status} onChange={(event) => setMilestoneForm({ ...milestoneForm, status: event.target.value as PlanningMilestone["status"] })}><option value="planned">Planned</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label><label className="initiative-field planning-field-wide"><span>Description</span><textarea rows={2} value={milestoneForm.description} onChange={(event) => setMilestoneForm({ ...milestoneForm, description: event.target.value })} placeholder="What should be reviewed at this point?" /></label><div className="planning-form-actions planning-field-wide"><button className="button button-dark" type="submit"><Plus size={14} aria-hidden="true" />{editingMilestoneId ? "Save milestone" : "Add milestone"}</button></div></form>
      {selectedDraft.milestones.length > 0 && <div className="milestone-list">{[...selectedDraft.milestones].sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")).map((milestone) => <article className="milestone-row" key={milestone.id}><span className={`milestone-marker ${milestone.status}`} /><div><strong>{milestone.title}</strong><p>{milestone.description || "No description provided."}</p><small>{milestone.dueDate ? formatDate(milestone.dueDate) : "Date not set"}{milestone.owner ? ` · ${milestone.owner}` : ""}</small></div><select aria-label={`Status for ${milestone.title}`} value={milestone.status} onChange={(event) => updateDraft({ ...selectedDraft, milestones: selectedDraft.milestones.map((item) => item.id === milestone.id ? { ...item, status: event.target.value as PlanningMilestone["status"] } : item) }, `Updated milestone: ${milestone.title}`)}><option value="planned">Planned</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select><button className="button button-outline" onClick={() => editMilestone(milestone)}>Edit</button><button className="icon-button" onClick={() => deleteMilestone(milestone)} aria-label={`Delete milestone ${milestone.title}`}><Trash2 size={15} aria-hidden="true" /></button></article>)}</div>}
    </section>

    <section className="panel initiative-detail-panel"><div className="panel-heading"><div><div className="overline">DECISION NOTE</div><h2>Capture a question or trade-off</h2></div><span className="local-data-badge">NOT AN APPROVAL</span></div><form className="initiative-notes-form" onSubmit={(event) => { event.preventDefault(); updateDraft({ ...selectedDraft, decisionNote: note, nextStep }, "Updated local planning note") }}><label className="initiative-field"><span>Options, questions, or trade-offs</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Capture a question or option for discussion." /></label><label className="initiative-field"><span>Proposed next step</span><input value={nextStep} onChange={(event) => setNextStep(event.target.value)} placeholder="e.g. Confirm who owns the baseline measurement" /></label><button className="button button-dark" type="submit"><Save size={14} aria-hidden="true" />Save local note</button></form></section>
    <div className="initiative-detail-actions"><button className="text-button" onClick={() => onNavigate("readiness")}>Review planning gaps <ArrowRight size={14} aria-hidden="true" /></button><button className="text-button" onClick={() => onNavigate("performance")}>Review business measures <ArrowRight size={14} aria-hidden="true" /></button></div>
    <p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />Completing a local planning action never implies approval to deploy, hire, spend money, execute a recommendation, or bypass an assurance gate.</p>
  </div>
}

function actionStatus(status: PlanningActionStatus) {
  return { todo: "To do", "in-progress": "In progress", waiting: "Waiting for information", completed: "Completed" }[status]
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}
