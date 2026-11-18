"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, CircleHelp, Gauge, Plus, Save, Trash2, X } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"
import { getKpiProgress, type InitiativeKpi, type KpiDirection, type KpiStatus } from "@/lib/planning-model"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

type KpiForm = {
  name: string
  description: string
  unit: string
  baseline: string
  target: string
  latestObserved: string
  measurementPeriod: string
  owner: string
  direction: KpiDirection
  status: KpiStatus
}

const emptyForm: KpiForm = { name: "", description: "", unit: "", baseline: "", target: "", latestObserved: "", measurementPeriod: "", owner: "", direction: "higher-is-better", status: "not-started" }

function parseValue(value: string) {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function showValue(value: number | null, unit: string) {
  return value === null ? "Not set" : `${value} ${unit}`.trim()
}

export function PerformanceOutcomesPage({ onNavigate }: { onNavigate: (id: ViewId) => void }) {
  const { selectedDraft, updateDraft } = useInitiativeWorkspace()
  const [form, setForm] = useState<KpiForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!selectedDraft) return <div className="page-stack"><div className="business-page-heading"><div><div className="overline">PERFORMANCE &amp; OUTCOMES</div><h1>Measure the outcomes that matter.</h1><p className="page-subtitle">Define a baseline, a target, and a clear measurement owner before results are available.</p></div></div><section className="panel initiative-empty"><span className="initiative-path-icon"><Gauge size={18} aria-hidden="true" /></span><div><h2>Select or create an initiative</h2><p>KPIs belong to an initiative and stay in this browser until you export them.</p></div><button className="button button-dark" onClick={() => onNavigate("F4")}>Start an initiative <ArrowRight size={14} aria-hidden="true" /></button><button className="button button-outline" onClick={() => onNavigate("example")}>Explore the fictional example</button></section></div>

  const resetForm = () => { setForm(emptyForm); setEditingId(null) }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const existing = editingId ? selectedDraft.kpis.find((item) => item.id === editingId) : undefined
    const latestObserved = parseValue(form.latestObserved)
    const metric: InitiativeKpi = {
      id: existing?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      description: form.description.trim(),
      unit: form.unit.trim(),
      baseline: parseValue(form.baseline),
      target: parseValue(form.target),
      latestObserved,
      measurementPeriod: form.measurementPeriod.trim(),
      owner: form.owner.trim(),
      direction: form.direction,
      status: latestObserved === null && form.status !== "needs-attention" ? "not-started" : form.status,
      source: "user-entered",
    }
    updateDraft({ ...selectedDraft, kpis: existing ? selectedDraft.kpis.map((item) => item.id === existing.id ? metric : item) : [...selectedDraft.kpis, metric] }, `${existing ? "Updated" : "Added"} KPI: ${metric.name}`)
    resetForm()
  }

  const editMetric = (metric: InitiativeKpi) => {
    setEditingId(metric.id)
    setForm({ name: metric.name, description: metric.description, unit: metric.unit, baseline: metric.baseline === null ? "" : String(metric.baseline), target: metric.target === null ? "" : String(metric.target), latestObserved: metric.latestObserved === null ? "" : String(metric.latestObserved), measurementPeriod: metric.measurementPeriod, owner: metric.owner, direction: metric.direction, status: metric.status })
  }

  const removeMetric = (metric: InitiativeKpi) => {
    if (!window.confirm(`Delete the KPI “${metric.name}” from this local initiative?`)) return
    updateDraft({ ...selectedDraft, kpis: selectedDraft.kpis.filter((item) => item.id !== metric.id) }, `Removed KPI: ${metric.name}`)
    if (editingId === metric.id) resetForm()
  }

  const measuredCount = selectedDraft.kpis.filter((metric) => metric.latestObserved !== null).length

  return <div className="page-stack planning-feature-page">
    <div className="business-page-heading"><div><div className="overline">PERFORMANCE &amp; OUTCOMES · LOCAL PLANNING</div><h1>Define success before you measure it.</h1><p className="page-subtitle">Create metrics for <strong>{selectedDraft.name}</strong>. Only values you enter appear here; the workspace does not generate measured results.</p></div></div>
    <div className="planning-feature-stats"><article className="panel"><span>KPIs defined</span><strong>{selectedDraft.kpis.length}</strong></article><article className="panel"><span>Measurements recorded</span><strong>{measuredCount}</strong></article><article className="panel"><span>Source</span><strong>{selectedDraft.source === "illustrative" ? "Example + your edits" : "Local entries"}</strong></article></div>

    <section className="panel planning-form-panel"><div className="panel-heading"><div><div className="overline">{editingId ? "EDIT KPI" : "OUTCOME PLANNING"}</div><h2>{editingId ? "Update this measure" : "Add a KPI"}</h2></div>{editingId && <button type="button" className="icon-button" onClick={resetForm} aria-label="Cancel KPI editing"><X size={16} aria-hidden="true" /></button>}</div>
      <form className="planning-form-grid" onSubmit={submit}>
        <label className="initiative-field"><span>Metric name <em>Required</em></span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Average customer wait time" /></label>
        <label className="initiative-field"><span>Unit of measurement <em>Required</em></span><input required value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} placeholder="minutes, orders/week, points" /></label>
        <label className="initiative-field planning-field-wide"><span>Description</span><textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What does this metric tell you?" /></label>
        <label className="initiative-field"><span>Baseline</span><input type="number" step="any" value={form.baseline} onChange={(event) => setForm({ ...form, baseline: event.target.value })} placeholder="Not known yet" /></label>
        <label className="initiative-field"><span>Target</span><input type="number" step="any" value={form.target} onChange={(event) => setForm({ ...form, target: event.target.value })} placeholder="Proposed target" /></label>
        <label className="initiative-field"><span>Latest observed value</span><input type="number" step="any" value={form.latestObserved} onChange={(event) => setForm({ ...form, latestObserved: event.target.value })} placeholder="Leave blank until measured" /></label>
        <label className="initiative-field"><span>Which direction is better?</span><select value={form.direction} onChange={(event) => setForm({ ...form, direction: event.target.value as KpiDirection })}><option value="higher-is-better">Higher is better</option><option value="lower-is-better">Lower is better</option></select></label>
        <label className="initiative-field"><span>Measurement period</span><input value={form.measurementPeriod} onChange={(event) => setForm({ ...form, measurementPeriod: event.target.value })} placeholder="e.g. Weekly" /></label>
        <label className="initiative-field"><span>Owner</span><input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Role or team responsible" /></label>
        <label className="initiative-field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as KpiStatus })}><option value="not-started">Measurement not started</option><option value="in-progress">In progress</option><option value="on-track">On track</option><option value="needs-attention">Needs attention</option></select></label>
        <div className="planning-form-actions planning-field-wide"><button className="button button-dark" type="submit"><Save size={14} aria-hidden="true" />{editingId ? "Save KPI" : "Add KPI"}</button></div>
      </form>
    </section>

    <section className="section-block"><div className="section-heading"><div><div className="overline">INITIATIVE MEASURES</div><h2>{selectedDraft.kpis.length ? `${selectedDraft.kpis.length} KPI${selectedDraft.kpis.length === 1 ? "" : "s"}` : "No KPIs defined yet"}</h2></div></div>
      {selectedDraft.kpis.length === 0 ? <div className="panel initiative-empty"><CircleHelp size={18} aria-hidden="true" /><p>Start with a useful measure, a known baseline if available, a proposed target, and someone who can review it.</p></div> : <div className="kpi-list">{selectedDraft.kpis.map((metric) => {
        const progress = getKpiProgress(metric)
        const sourceLabel = metric.source === "illustrative" ? "ILLUSTRATIVE" : metric.source === "backend-verified" ? "BACKEND-VERIFIED" : "USER-ENTERED"
        return <article className="panel kpi-card" key={metric.id}>
          <div className="kpi-card-heading"><div><span className="overline">{metric.direction === "higher-is-better" ? "HIGHER IS BETTER" : "LOWER IS BETTER"}</span><h3>{metric.name}</h3><p>{metric.description || "No description provided."}</p></div><span className={`planning-source-badge ${metric.source}`}>{sourceLabel}</span></div>
          <div className="kpi-value-grid"><div><span>Baseline</span><strong>{showValue(metric.baseline, metric.unit)}</strong></div><div><span>Target</span><strong>{showValue(metric.target, metric.unit)}</strong></div><div><span>Latest observed</span><strong>{showValue(metric.latestObserved, metric.unit)}</strong></div><div><span>Status</span><strong>{metric.latestObserved === null ? "Measurement not started" : statusLabel(metric.status)}</strong></div></div>
          {progress !== null ? <div className="kpi-progress"><div className="kpi-progress-label"><span>Progress from baseline toward target</span><strong>{progress}%</strong></div><div className="planning-progress-track" role="progressbar" aria-label={`${metric.name} progress toward target`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div></div> : <div className="kpi-not-measured"><CircleHelp size={14} aria-hidden="true" /><span>{metric.latestObserved === null ? "Measurement has not begun. No observed result is available." : "Add a distinct baseline and target to calculate progress."}</span></div>}
          <div className="kpi-card-footer"><span>{metric.measurementPeriod || "Measurement period not set"}{metric.owner ? ` · Owner: ${metric.owner}` : ""}</span><div><button className="button button-outline" onClick={() => editMetric(metric)}>Edit / record value</button><button className="icon-button" onClick={() => removeMetric(metric)} aria-label={`Delete KPI ${metric.name}`}><Trash2 size={15} aria-hidden="true" /></button></div></div>
        </article>
      })}</div>}
    </section>
    <p className="initiative-storage-note"><CircleHelp size={15} aria-hidden="true" />Illustrative values are fictional. User-entered values are not independently verified. A completed KPI or action does not authorize deployment or operational change.</p>
  </div>
}

function statusLabel(status: KpiStatus) {
  return { "not-started": "Not started", "in-progress": "In progress", "on-track": "On track", "needs-attention": "Needs attention" }[status]
}
