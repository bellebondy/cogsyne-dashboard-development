"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

const STORAGE_KEY = "comradii.initiative-workspace.v1"

export const assessmentAreas = [
  { id: "people", label: "People & Skills", why: "Will employees need training to work confidently with this AI?", evidence: ["Roles and skills involved", "Training, guidance, or human oversight"] },
  { id: "processes", label: "Processes & Operations", why: "Would current workflows need to change, and who can review or override the AI?", evidence: ["How the process works today", "Review, handoff, and override steps"] },
  { id: "product", label: "Technology & Information", why: "Do you have the systems and appropriate information this use may need?", evidence: ["Intended use and people affected", "Data, integration, and quality needs"] },
  { id: "delivery", label: "Project Planning", why: "What owners, resources, and milestones would make the work practical?", evidence: ["Owner, milestones, and dependencies", "Change and rollout considerations"] },
  { id: "performance", label: "Performance & Business Value", why: "How will you know whether the AI is delivering useful results?", evidence: ["Baseline and target, if known", "Measurement source and review period"] },
  { id: "security", label: "Security & Risk", why: "Would the idea use sensitive information or introduce new risks?", evidence: ["Data sensitivity and access needs", "Applicable controls and review owners"] },
] as const

export type AssessmentAreaId = (typeof assessmentAreas)[number]["id"]
export type InitiativeDraft = {
  id: string
  name: string
  goal: string
  objective: string
  department: string
  challenge: string
  currentProcess: string
  peopleImpacted: string
  intendedUse: string
  expectedBenefit: string
  successLooksLike: string
  peopleSkills: string
  resourceNeeds: string
  successMetric: string
  baseline: string
  target: string
  unit: string
  measurementPeriod: string
  assessmentAreas: AssessmentAreaId[]
  checklist: Partial<Record<AssessmentAreaId, boolean>>
  decisionNote: string
  nextStep: string
  updatedAt: string
}

type StoredWorkspace = { drafts: InitiativeDraft[]; selectedId: string | null }
type WorkspaceValue = StoredWorkspace & {
  loaded: boolean
  selectedDraft: InitiativeDraft | null
  saveDraft: (draft: Omit<InitiativeDraft, "id" | "updatedAt" | "checklist" | "decisionNote" | "nextStep"> & Partial<Pick<InitiativeDraft, "id" | "checklist" | "decisionNote" | "nextStep">>) => InitiativeDraft
  updateDraft: (draft: InitiativeDraft) => void
  deleteDraft: (id: string) => void
  selectInitiative: (id: string | null) => void
}

const InitiativeWorkspaceContext = createContext<WorkspaceValue | null>(null)

function isAssessmentAreaId(value: unknown): value is AssessmentAreaId {
  return assessmentAreas.some((area) => area.id === value)
}

function parseDraft(value: unknown): value is InitiativeDraft {
  if (!value || typeof value !== "object") return false
  const draft = value as Partial<InitiativeDraft>
  return typeof draft.id === "string"
    && typeof draft.name === "string"
    && typeof draft.goal === "string"
    && typeof draft.objective === "string"
    && typeof draft.department === "string"
    && typeof draft.challenge === "string"
    && Array.isArray(draft.assessmentAreas)
    && draft.assessmentAreas.every(isAssessmentAreaId)
}

export function InitiativeWorkspaceProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<InitiativeDraft[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (parsed && typeof parsed === "object") {
          const stored = parsed as Partial<StoredWorkspace>
          setDrafts(Array.isArray(stored.drafts) ? stored.drafts.filter(parseDraft).map((draft) => ({ ...draft, currentProcess: draft.currentProcess ?? "", peopleImpacted: draft.peopleImpacted ?? "", successLooksLike: draft.successLooksLike ?? "" })) : [])
          setSelectedId(stored.selectedId === "atlas-example" ? "cheesecake-demo" : typeof stored.selectedId === "string" ? stored.selectedId : null)
        }
      }
    } catch {
      setDrafts([])
      setSelectedId(null)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ drafts, selectedId }))
    } catch {
      // Browser storage can be unavailable in private or restricted browsing modes.
    }
  }, [drafts, loaded, selectedId])

  const saveDraft = useCallback<WorkspaceValue["saveDraft"]>((input) => {
    const existing = input.id ? drafts.find((draft) => draft.id === input.id) : undefined
    const draft: InitiativeDraft = {
      ...existing,
      ...input,
      id: existing?.id ?? input.id ?? crypto.randomUUID(),
      checklist: input.checklist ?? existing?.checklist ?? {},
      decisionNote: input.decisionNote ?? existing?.decisionNote ?? "",
      nextStep: input.nextStep ?? existing?.nextStep ?? "",
      updatedAt: new Date().toISOString(),
    }
    setDrafts((current) => current.some((item) => item.id === draft.id)
      ? current.map((item) => item.id === draft.id ? draft : item)
      : [draft, ...current])
    setSelectedId(draft.id)
    return draft
  }, [drafts])

  const updateDraft = useCallback((draft: InitiativeDraft) => {
    setDrafts((current) => current.map((item) => item.id === draft.id ? { ...draft, updatedAt: new Date().toISOString() } : item))
  }, [])

  const deleteDraft = useCallback((id: string) => {
    setDrafts((current) => current.filter((draft) => draft.id !== id))
    setSelectedId((current) => current === id ? null : current)
  }, [])

  const value = useMemo<WorkspaceValue>(() => ({
    drafts,
    selectedId,
    selectedDraft: drafts.find((draft) => draft.id === selectedId) ?? null,
    loaded,
    saveDraft,
    updateDraft,
    deleteDraft,
    selectInitiative: setSelectedId,
  }), [deleteDraft, drafts, loaded, saveDraft, selectedId, updateDraft])

  return <InitiativeWorkspaceContext.Provider value={value}>{children}</InitiativeWorkspaceContext.Provider>
}

export function useInitiativeWorkspace() {
  const context = useContext(InitiativeWorkspaceContext)
  if (!context) throw new Error("useInitiativeWorkspace must be used within InitiativeWorkspaceProvider")
  return context
}
