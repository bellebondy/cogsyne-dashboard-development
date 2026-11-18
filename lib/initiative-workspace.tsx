"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { CHEESECAKE_DEMO_ID, TECHNICAL_FIXTURE_ID } from "@/lib/founder-demo-data"
import { assessmentAreas, createCheesecakeExampleDraft, type AssessmentAreaId, type InitiativeDraft, type PlanningActivity } from "@/lib/planning-model"

const STORAGE_KEY = "comradii.initiative-workspace.v3"
const LEGACY_STORAGE_KEYS = ["comradii.initiative-workspace.v2", "comradii.initiative-workspace.v1"]

type WorkspaceMode = "customer" | "example" | "capstone"
type PersistentWorkspaceMode = Exclude<WorkspaceMode, "capstone">

export { assessmentAreas }
export type { AssessmentAreaId, InitiativeDraft }

type StoredWorkspace = { drafts: InitiativeDraft[]; selectedId: string | null; exampleDraft?: InitiativeDraft; mode?: PersistentWorkspaceMode; exampleMode?: boolean }
type WorkspaceValue = Omit<StoredWorkspace, "mode"> & {
  loaded: boolean
  mode: WorkspaceMode
  isExampleMode: boolean
  isCapstoneMode: boolean
  customerDraft: InitiativeDraft | null
  selectedDraft: InitiativeDraft | null
  saveDraft: (draft: Partial<InitiativeDraft> & Pick<InitiativeDraft, "name" | "goal" | "objective" | "department" | "challenge">) => InitiativeDraft
  updateDraft: (draft: InitiativeDraft, activitySummary?: string) => void
  deleteDraft: (id: string) => void
  selectInitiative: (id: string | null) => void
  resetExample: () => void
  enterExample: () => void
  leaveExample: () => void
  enterCapstone: () => void
  leaveCapstone: () => void
  exportDraft: (draft: InitiativeDraft) => void
}

const InitiativeWorkspaceContext = createContext<WorkspaceValue | null>(null)

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function isAssessmentAreaId(value: unknown): value is AssessmentAreaId {
  return assessmentAreas.some((area) => area.id === value)
}

function normalizeDraft(value: unknown): InitiativeDraft | null {
  if (!isObject(value) || typeof value.id !== "string" || typeof value.name !== "string") return null
  const draft = value as Partial<InitiativeDraft>
  const stringFields = ["description", "goal", "objective", "department", "challenge", "currentProcess", "peopleImpacted", "intendedUse", "expectedBenefit", "successLooksLike", "peopleSkills", "resourceNeeds", "successMetric", "baseline", "target", "unit", "measurementPeriod", "decisionNote", "nextStep"] as const
  const normalized = { ...draft } as InitiativeDraft
  for (const field of stringFields) normalized[field] = typeof draft[field] === "string" ? draft[field] as string : ""
  normalized.assessmentAreas = Array.isArray(draft.assessmentAreas) ? draft.assessmentAreas.filter(isAssessmentAreaId) : []
  normalized.checklist = isObject(draft.checklist) ? Object.fromEntries(Object.entries(draft.checklist).filter(([key, item]) => isAssessmentAreaId(key) && typeof item === "boolean")) as Partial<Record<AssessmentAreaId, boolean>> : {}
  normalized.readinessAnswers = isObject(draft.readinessAnswers) ? Object.fromEntries(Object.entries(draft.readinessAnswers).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {}
  normalized.readinessNotes = isObject(draft.readinessNotes) ? Object.fromEntries(Object.entries(draft.readinessNotes).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {}
  normalized.kpis = Array.isArray(draft.kpis) ? draft.kpis.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.name === "string") as InitiativeDraft["kpis"] : []
  normalized.stakeholders = Array.isArray(draft.stakeholders) ? draft.stakeholders.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.role === "string") as InitiativeDraft["stakeholders"] : []
  normalized.skills = Array.isArray(draft.skills) ? draft.skills.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.name === "string") as InitiativeDraft["skills"] : []
  normalized.actions = Array.isArray(draft.actions) ? draft.actions.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.title === "string") as InitiativeDraft["actions"] : []
  normalized.evidence = Array.isArray(draft.evidence) ? draft.evidence.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.title === "string") as InitiativeDraft["evidence"] : []
  normalized.milestones = Array.isArray(draft.milestones) ? draft.milestones.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.title === "string") as InitiativeDraft["milestones"] : []
  normalized.activity = Array.isArray(draft.activity) ? draft.activity.filter((item) => isObject(item) && typeof item.id === "string" && typeof item.summary === "string") as PlanningActivity[] : []
  normalized.source = draft.source === "illustrative" ? "illustrative" : "user"
  normalized.updatedAt = typeof draft.updatedAt === "string" ? draft.updatedAt : new Date(0).toISOString()
  return normalized
}

function createActivity(summary: string): PlanningActivity {
  return { id: crypto.randomUUID(), summary, occurredAt: new Date().toISOString() }
}

export function InitiativeWorkspaceProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<InitiativeDraft[]>([])
  const [exampleDraft, setExampleDraft] = useState<InitiativeDraft>(() => createCheesecakeExampleDraft())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<WorkspaceMode>("customer")
  const [capstoneReturnMode, setCapstoneReturnMode] = useState<PersistentWorkspaceMode>("customer")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY) ?? LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (isObject(parsed)) {
          const stored = parsed as Partial<StoredWorkspace> & { exampleReturnId?: unknown }
          const existingDrafts = Array.isArray(stored.drafts)
            ? stored.drafts.map(normalizeDraft).filter((draft): draft is InitiativeDraft => draft !== null && draft.id !== CHEESECAKE_DEMO_ID && draft.id !== TECHNICAL_FIXTURE_ID)
            : []
          setDrafts(existingDrafts)
          const example = normalizeDraft(stored.exampleDraft)
          setExampleDraft(example?.id === CHEESECAKE_DEMO_ID ? { ...createCheesecakeExampleDraft(), ...example, source: "illustrative" } : createCheesecakeExampleDraft())

          const rawSelectedId = stored.selectedId === "atlas-example" ? CHEESECAKE_DEMO_ID : typeof stored.selectedId === "string" ? stored.selectedId : null
          const legacyReturnId = typeof stored.exampleReturnId === "string" ? stored.exampleReturnId : null
          const customerSelection = rawSelectedId === CHEESECAKE_DEMO_ID || rawSelectedId === TECHNICAL_FIXTURE_ID ? legacyReturnId : rawSelectedId
          setSelectedId(existingDrafts.some((draft) => draft.id === customerSelection) ? customerSelection : null)
          const restoredMode = stored.mode === "example" || stored.exampleMode === true || rawSelectedId === CHEESECAKE_DEMO_ID ? "example" : "customer"
          setMode(restoredMode)
          setCapstoneReturnMode(restoredMode)
        }
      }
    } catch {
      setDrafts([])
      setExampleDraft(createCheesecakeExampleDraft())
      setSelectedId(null)
      setMode("customer")
      setCapstoneReturnMode("customer")
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      const persistentMode = mode === "capstone" ? capstoneReturnMode : mode
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 3, drafts, selectedId, exampleDraft, mode: persistentMode }))
    } catch {
      // Browser storage can be unavailable in private or restricted browsing modes.
    }
  }, [capstoneReturnMode, drafts, exampleDraft, loaded, mode, selectedId])

  const saveDraft = useCallback<WorkspaceValue["saveDraft"]>((input) => {
    const existing = input.id ? drafts.find((draft) => draft.id === input.id) : undefined
    const now = new Date().toISOString()
    const draft = normalizeDraft({
      ...existing,
      ...input,
      id: existing?.id ?? input.id ?? crypto.randomUUID(),
      checklist: input.checklist ?? existing?.checklist ?? {},
      decisionNote: input.decisionNote ?? existing?.decisionNote ?? "",
      nextStep: input.nextStep ?? existing?.nextStep ?? "",
      readinessAnswers: input.readinessAnswers ?? existing?.readinessAnswers ?? {},
      readinessNotes: input.readinessNotes ?? existing?.readinessNotes ?? {},
      kpis: input.kpis ?? existing?.kpis ?? [],
      stakeholders: input.stakeholders ?? existing?.stakeholders ?? [],
      skills: input.skills ?? existing?.skills ?? [],
      actions: input.actions ?? existing?.actions ?? [],
      evidence: input.evidence ?? existing?.evidence ?? [],
      milestones: input.milestones ?? existing?.milestones ?? [],
      activity: [...(existing?.activity ?? []), createActivity(existing ? "Initiative details updated" : "Initiative created")],
      source: "user",
      updatedAt: now,
    })
    if (!draft) throw new Error("Unable to create the initiative draft.")
    setDrafts((current) => current.some((item) => item.id === draft.id)
      ? current.map((item) => item.id === draft.id ? draft : item)
      : [draft, ...current])
    setSelectedId(draft.id)
    setMode("customer")
    return draft
  }, [drafts])

  const updateDraft = useCallback<WorkspaceValue["updateDraft"]>((draft, activitySummary) => {
    const nextDraft = {
      ...draft,
      activity: activitySummary ? [...draft.activity, createActivity(activitySummary)].slice(-80) : draft.activity,
      updatedAt: new Date().toISOString(),
    }
    if (draft.id === CHEESECAKE_DEMO_ID) setExampleDraft(nextDraft)
    else setDrafts((current) => current.map((item) => item.id === draft.id ? nextDraft : item))
  }, [])

  const deleteDraft = useCallback((id: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id))
    setSelectedId((current) => current === id ? null : current)
  }, [])

  const resetExample = useCallback(() => {
    setExampleDraft(createCheesecakeExampleDraft())
  }, [])

  const enterExample = useCallback(() => {
    setMode("example")
  }, [])

  const leaveExample = useCallback(() => {
    setMode((current) => current === "example" ? "customer" : current)
  }, [])

  const enterCapstone = useCallback(() => {
    if (mode !== "capstone") setCapstoneReturnMode(mode)
    setMode("capstone")
  }, [mode])

  const leaveCapstone = useCallback(() => {
    setMode((current) => current === "capstone" ? capstoneReturnMode : current)
  }, [capstoneReturnMode])

  const selectInitiative = useCallback((id: string | null) => {
    setSelectedId(id !== null && drafts.some((draft) => draft.id === id) ? id : null)
    setMode("customer")
  }, [drafts])

  const exportDraft = useCallback((draft: InitiativeDraft) => {
    const file = new Blob([JSON.stringify({ schemaVersion: 2, exportedAt: new Date().toISOString(), classification: draft.source === "illustrative" ? "fictional illustrative planning data; not verified" : "user-entered local planning data; not verified", initiative: draft }, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(file)
    const link = document.createElement("a")
    link.href = url
    link.download = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "initiative"}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [])

  const customerDraft = drafts.find((draft) => draft.id === selectedId) ?? null
  const selectedDraft = mode === "example" ? exampleDraft : mode === "customer" ? customerDraft : null
  const value = useMemo<WorkspaceValue>(() => ({
    drafts,
    selectedId,
    selectedDraft,
    customerDraft,
    exampleDraft,
    mode,
    isExampleMode: mode === "example",
    isCapstoneMode: mode === "capstone",
    loaded,
    saveDraft,
    updateDraft,
    deleteDraft,
    selectInitiative,
    resetExample,
    enterExample,
    leaveExample,
    enterCapstone,
    leaveCapstone,
    exportDraft,
  }), [customerDraft, deleteDraft, drafts, enterCapstone, enterExample, exampleDraft, exportDraft, leaveCapstone, leaveExample, loaded, mode, resetExample, saveDraft, selectedDraft, selectedId, selectInitiative, updateDraft])

  return <InitiativeWorkspaceContext.Provider value={value}>{children}</InitiativeWorkspaceContext.Provider>
}

export function useInitiativeWorkspace() {
  const context = useContext(InitiativeWorkspaceContext)
  if (!context) throw new Error("useInitiativeWorkspace must be used within InitiativeWorkspaceProvider")
  return context
}
