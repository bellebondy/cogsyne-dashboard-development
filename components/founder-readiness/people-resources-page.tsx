"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, BookOpenCheck, CircleHelp, Plus, Save, Trash2, Users, X } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import type { InitiativeStakeholder, SkillRequirement, StakeholderKind } from "@/lib/planning-model"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

type StakeholderForm = { name: string; role: string; kind: StakeholderKind; responsibilities: string; skills: string }
type SkillForm = { name: string; trainingConsideration: string; status: SkillRequirement["status"] }
const emptyStakeholder: StakeholderForm = { name: "", role: "", kind: "other", responsibilities: "", skills: "" }
const emptySkill: SkillForm = { name: "", trainingConsideration: "", status: "identified" }
const stakeholderKinds: { value: StakeholderKind; label: string }[] = [
  { value: "initiative-owner", label: "Initiative owner" },
  { value: "business-sponsor", label: "Business sponsor" },
  { value: "technical-contact", label: "Technical contact" },
  { value: "reviewer", label: "Review / oversight" },
  { value: "other", label: "Other role" },
]

export function PeopleResourcesPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const { selectedDraft, updateDraft } = useInitiativeWorkspace()
  const [stakeholderForm, setStakeholderForm] = useState<StakeholderForm>(emptyStakeholder)
  const [editingStakeholderId, setEditingStakeholderId] = useState<string | null>(null)
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkill)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)

  if (!selectedDraft) return <div className="page-stack"><div className="business-page-heading"><div><div className="overline">PEOPLE &amp; RESOURCES</div><h1>Plan who should be involved.</h1><p className="page-subtitle">Capture roles, oversight responsibilities, skills, and training considerations for an initiative.</p></div></div><section className="panel initiative-empty"><span className="initiative-path-icon"><Users size={18} aria-hidden="true" /></span><div><h2>Select or create an initiative</h2><p>People and resource notes are kept with the selected initiative in this browser.</p></div><button className="button button-dark" onClick={() => onNavigate("F4")}>Start an initiative <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("example")}>Explore the fictional example</button></section></div>

  const resetStakeholder = () => { setStakeholderForm(emptyStakeholder); setEditingStakeholderId(null) }
  const saveStakeholder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const previous = editingStakeholderId ? selectedDraft.stakeholders.find((item) => item.id === editingStakeholderId) : undefined
    const stakeholder: InitiativeStakeholder = { id: previous?.id ?? crypto.randomUUID(), name: stakeholderForm.name.trim(), role: stakeholderForm.role.trim(), kind: stakeholderForm.kind, responsibilities: stakeholderForm.responsibilities.trim(), skills: stakeholderForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean) }
    updateDraft({ ...selectedDraft, stakeholders: previous ? selectedDraft.stakeholders.map((item) => item.id === previous.id ? stakeholder : item) : [...selectedDraft.stakeholders, stakeholder] }, `${previous ? "Updated" : "Added"} stakeholder role: ${stakeholder.role}`)
    resetStakeholder()
  }
  const editStakeholder = (item: InitiativeStakeholder) => {
    setEditingStakeholderId(item.id)
    setStakeholderForm({ name: item.name, role: item.role, kind: item.kind, responsibilities: item.responsibilities, skills: item.skills.join(", ") })
  }
  const removeStakeholder = (item: InitiativeStakeholder) => {
    if (!window.confirm(`Remove ${item.role} from this local initiative?`)) return
    updateDraft({ ...selectedDraft, stakeholders: selectedDraft.stakeholders.filter((person) => person.id !== item.id) }, `Removed stakeholder role: ${item.role}`)
    if (editingStakeholderId === item.id) resetStakeholder()
  }

  const resetSkill = () => { setSkillForm(emptySkill); setEditingSkillId(null) }
  const saveSkill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const previous = editingSkillId ? selectedDraft.skills.find((item) => item.id === editingSkillId) : undefined
    const skill: SkillRequirement = { id: previous?.id ?? crypto.randomUUID(), name: skillForm.name.trim(), trainingConsideration: skillForm.trainingConsideration.trim(), status: skillForm.status }
    updateDraft({ ...selectedDraft, skills: previous ? selectedDraft.skills.map((item) => item.id === previous.id ? skill : item) : [...selectedDraft.skills, skill] }, `${previous ? "Updated" : "Added"} skill consideration: ${skill.name}`)
    resetSkill()
  }
  const editSkill = (skill: SkillRequirement) => {
    setEditingSkillId(skill.id)
    setSkillForm({ name: skill.name, trainingConsideration: skill.trainingConsideration, status: skill.status })
  }
  const removeSkill = (skill: SkillRequirement) => {
    if (!window.confirm(`Remove the “${skill.name}” skill consideration?`)) return
    updateDraft({ ...selectedDraft, skills: selectedDraft.skills.filter((item) => item.id !== skill.id) }, `Removed skill consideration: ${skill.name}`)
    if (editingSkillId === skill.id) resetSkill()
  }

  const roleFor = (kind: StakeholderKind) => selectedDraft.stakeholders.find((person) => person.kind === kind)
  const gaps = selectedDraft.skills.filter((skill) => skill.status !== "identified").length + selectedDraft.actions.filter((action) => action.readinessArea === "people" && action.status !== "completed").length

  return <div className="page-stack planning-feature-page">
    <div className="business-page-heading"><div><div className="overline">PEOPLE &amp; RESOURCES · LOCAL PLANNING</div><h1>Plan roles, skills, and support.</h1><p className="page-subtitle">Identify who should contribute to <strong>{selectedDraft.name}</strong>. Roles describe planning needs, not verified qualifications or assigned employees.</p></div></div>
    <div className="planning-feature-stats"><article className="panel"><span>Stakeholder roles</span><strong>{selectedDraft.stakeholders.length}</strong></article><article className="panel"><span>Skills to consider</span><strong>{selectedDraft.skills.length}</strong></article><article className="panel"><span>Open resource gaps</span><strong>{gaps}</strong></article></div>

    <section className="section-block"><div className="section-heading"><div><div className="overline">RESPONSIBILITY MAP</div><h2>Key roles to identify</h2></div></div><div className="people-role-grid">{stakeholderKinds.slice(0, 4).map(({ value, label }) => { const role = roleFor(value); return <article className="panel people-role-card" key={value}><span>{label}</span><strong>{role?.role ?? "Not identified"}</strong><small>{role?.name || (role ? "Role only" : "Add a role below")}</small></article> })}</div></section>

    <section className="planning-editor-grid">
      <article className="panel planning-form-panel"><div className="panel-heading"><div><div className="overline">STAKEHOLDERS &amp; RESPONSIBILITIES</div><h2>{editingStakeholderId ? "Edit role" : "Add a stakeholder role"}</h2></div>{editingStakeholderId && <button type="button" className="icon-button" onClick={resetStakeholder} aria-label="Cancel stakeholder editing"><X size={16} aria-hidden="true" /></button>}</div>
        <form className="planning-form-grid" onSubmit={saveStakeholder}>
          <label className="initiative-field"><span>Person name <small>Optional; a role is enough</small></span><input value={stakeholderForm.name} onChange={(event) => setStakeholderForm({ ...stakeholderForm, name: event.target.value })} placeholder="Leave blank to plan by role" /></label>
          <label className="initiative-field"><span>Role or team <em>Required</em></span><input required value={stakeholderForm.role} onChange={(event) => setStakeholderForm({ ...stakeholderForm, role: event.target.value })} placeholder="e.g. Operations manager" /></label>
          <label className="initiative-field"><span>Responsibility type</span><select value={stakeholderForm.kind} onChange={(event) => setStakeholderForm({ ...stakeholderForm, kind: event.target.value as StakeholderKind })}>{stakeholderKinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}</select></label>
          <label className="initiative-field"><span>Skills or knowledge</span><input value={stakeholderForm.skills} onChange={(event) => setStakeholderForm({ ...stakeholderForm, skills: event.target.value })} placeholder="Separate skills with commas" /></label>
          <label className="initiative-field planning-field-wide"><span>Responsibilities and review needs</span><textarea rows={2} value={stakeholderForm.responsibilities} onChange={(event) => setStakeholderForm({ ...stakeholderForm, responsibilities: event.target.value })} placeholder="What should this role contribute or review?" /></label>
          <div className="planning-form-actions planning-field-wide"><button className="button button-dark" type="submit"><Save size={14} aria-hidden="true" />{editingStakeholderId ? "Save role" : "Add role"}</button></div>
        </form>
      </article>
      <article className="panel planning-form-panel"><div className="panel-heading"><div><div className="overline">SKILLS &amp; TRAINING</div><h2>{editingSkillId ? "Edit skill consideration" : "Add a skill or training need"}</h2></div>{editingSkillId && <button type="button" className="icon-button" onClick={resetSkill} aria-label="Cancel skill editing"><X size={16} aria-hidden="true" /></button>}</div>
        <form className="planning-form-grid" onSubmit={saveSkill}>
          <label className="initiative-field planning-field-wide"><span>Skill or capability <em>Required</em></span><input required value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} placeholder="e.g. Reviewing AI-generated recommendations" /></label>
          <label className="initiative-field planning-field-wide"><span>Training consideration</span><textarea rows={2} value={skillForm.trainingConsideration} onChange={(event) => setSkillForm({ ...skillForm, trainingConsideration: event.target.value })} placeholder="What guidance might help someone perform this role?" /></label>
          <label className="initiative-field planning-field-wide"><span>Planning status</span><select value={skillForm.status} onChange={(event) => setSkillForm({ ...skillForm, status: event.target.value as SkillRequirement["status"] })}><option value="identified">Identified for planning</option><option value="training-needed">Training may be needed</option><option value="not-yet-assessed">Needs further review</option></select></label>
          <div className="planning-form-actions planning-field-wide"><button className="button button-dark" type="submit"><Plus size={14} aria-hidden="true" />{editingSkillId ? "Save skill" : "Add skill"}</button></div>
        </form>
      </article>
    </section>

    <section className="planning-editor-grid">
      <article className="panel people-list-panel"><div className="panel-heading"><div><div className="overline">INITIATIVE PEOPLE</div><h2>Stakeholder roles</h2></div><span className="local-data-badge">{selectedDraft.stakeholders.length} roles</span></div>
        {selectedDraft.stakeholders.length === 0 ? <div className="initiative-empty"><Users size={18} aria-hidden="true" /><p>Start with the initiative owner, a business sponsor, a technical contact, and anyone who should review or oversee the work.</p></div> : <div className="planning-item-list">{selectedDraft.stakeholders.map((person) => <article className="planning-list-item" key={person.id}><div><span className="overline">{stakeholderKinds.find((kind) => kind.value === person.kind)?.label ?? "Other role"}</span><h3>{person.role}</h3><p>{person.responsibilities || "Responsibilities not yet described."}</p>{person.name && <small>{person.name}</small>}<div className="planning-chip-list">{person.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><div className="planning-item-actions"><button className="button button-outline" onClick={() => editStakeholder(person)}>Edit</button><button className="icon-button" onClick={() => removeStakeholder(person)} aria-label={`Remove ${person.role}`}><Trash2 size={15} aria-hidden="true" /></button></div></article>)}</div>}
      </article>
      <article className="panel people-list-panel"><div className="panel-heading"><div><div className="overline">CAPABILITY PLAN</div><h2>Skills and training</h2></div><span className="local-data-badge">{selectedDraft.skills.length} items</span></div>
        {selectedDraft.skills.length === 0 ? <div className="initiative-empty"><BookOpenCheck size={18} aria-hidden="true" /><p>List the capabilities people may need and note training or guidance to consider.</p></div> : <div className="planning-item-list">{selectedDraft.skills.map((skill) => <article className="planning-list-item compact" key={skill.id}><div><span className={`planning-area-state ${skill.status === "identified" ? "complete" : "in-progress"}`}>{skillStatus(skill.status)}</span><h3>{skill.name}</h3><p>{skill.trainingConsideration || "No training note yet."}</p></div><div className="planning-item-actions"><button className="button button-outline" onClick={() => editSkill(skill)}>Edit</button><button className="icon-button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill.name}`}><Trash2 size={15} aria-hidden="true" /></button></div></article>)}</div>}
      </article>
    </section>

    {selectedDraft.actions.some((action) => action.readinessArea === "people" && action.status !== "completed") && <section className="panel people-gap-panel"><div className="panel-heading"><div><div className="overline">RELATED PLANNING ACTIONS</div><h2>Open people and training follow-ups</h2></div><button className="text-button" onClick={() => onNavigate("decision")}>Open action tracker <ArrowRight size={14} aria-hidden="true" /></button></div><ul>{selectedDraft.actions.filter((action) => action.readinessArea === "people" && action.status !== "completed").map((action) => <li key={action.id}><strong>{action.title}</strong>{action.owner ? ` · ${action.owner}` : ""}</li>)}</ul></section>}
    <p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />This workspace records planning roles only. It does not verify anyone&apos;s qualifications; F1 and F11 results are not available here.</p>
  </div>
}

function skillStatus(status: SkillRequirement["status"]) {
  return { identified: "Identified", "training-needed": "Training may be needed", "not-yet-assessed": "Needs review" }[status]
}
