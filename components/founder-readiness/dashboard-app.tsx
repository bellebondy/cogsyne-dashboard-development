"use client"

import { useRef, useState } from "react"
import { Search, X } from "lucide-react"
import { CHEESECAKE_DEMO_ID, TECHNICAL_FIXTURE_ID, factories, scenarioSteps, type FactoryId, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { getApiError, getBackendStatus, getUpdatedWorkflowState, isJsonObject, isSuccessfulStepResponse, type ApiRequestResult, type JsonObject, type StepExecutionResult } from "@/lib/demo-api"
import { FactoryPage } from "./factory-page"
import { GuidedDemoPage } from "./guided-demo-page"
import { HumanDecisionPage } from "./human-decision-page"
import { OverviewPage } from "./overview-page"
import { ReadinessPage } from "./readiness-page"
import { PerformanceOutcomesPage } from "./performance-outcomes-page"
import { PeopleResourcesPage } from "./people-resources-page"
import { EvidenceActivityPage } from "./evidence-activity-page"
import { CapstoneShowcasePage } from "./capstone-showcase-page"
import { mobileLinks, Sidebar, viewLabels } from "./sidebar"
import { InitiativeWorkspaceProvider, useInitiativeWorkspace } from "@/lib/initiative-workspace"
import { InitiativesPage } from "./initiatives-page"
import { ThemeToggle } from "./theme-toggle"
import { PlanningDecisionPage } from "./planning-decision-page"
import { CheesecakeDemoPage } from "./cheesecake-demo-page"
import { FranklinChat } from "./franklin-chat"

const isFactoryView = (view: ViewId): view is FactoryId => factories.some((factory) => factory.id === view)
const showCapstone = process.env.NEXT_PUBLIC_SHOW_CAPSTONE !== "false"

export default function DashboardApp() {
  return <InitiativeWorkspaceProvider><DashboardAppShell /></InitiativeWorkspaceProvider>
}

function DashboardAppShell() {
  const { loaded, selectedId, selectedDraft, selectInitiative } = useInitiativeWorkspace()
  const [active, setActive] = useState<ViewId>("overview")
  const [search, setSearch] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [stepResults, setStepResults] = useState<Partial<Record<number, StepExecutionResult>>>({})
  const workflowStateRef = useRef<JsonObject>({})
  const workflowStateSnapshotsRef = useRef<Partial<Record<number, JsonObject>>>({})
  const [disposition, setDisposition] = useState<HumanDisposition | null>(null)
  const [runMessage, setRunMessage] = useState("Ready to connect to the COMRADII demo backend.")
  const [configRequest, setConfigRequest] = useState<ApiRequestResult | null>(null)
  const [healthRequest, setHealthRequest] = useState<ApiRequestResult | null>(null)
  const [configPayload, setConfigPayload] = useState<unknown>(null)
  const [healthPayload, setHealthPayload] = useState<unknown>(null)
  const [busyAction, setBusyAction] = useState<"checking" | "all" | number | null>(null)

  const callDemoApi = async (path: string, method: "GET" | "POST" = "GET", state?: JsonObject): Promise<ApiRequestResult> => {
    const startedAt = performance.now()
    const requestedAt = new Date().toISOString()
    try {
      const response = await fetch(`/api/demo/${path}`, {
        method,
        headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
        body: method === "POST" ? JSON.stringify({ state: state ?? {} }) : undefined,
        cache: "no-store",
      })
      const responseText = await response.text()
      let payload: unknown = responseText
      try { payload = responseText ? JSON.parse(responseText) : null } catch { payload = { message: responseText } }
      return {
        method,
        path: `/api/${path}`,
        httpStatus: response.status,
        upstreamResponded: response.headers.has("x-demo-upstream-status"),
        ok: response.ok,
        durationMs: Math.round(performance.now() - startedAt),
        requestedAt,
        payload,
        error: response.ok ? undefined : getApiError(payload) ?? `Request failed with HTTP ${response.status}.`,
      }
    } catch {
      return {
        method,
        path: `/api/${path}`,
        httpStatus: null,
        upstreamResponded: false,
        ok: false,
        durationMs: Math.round(performance.now() - startedAt),
        requestedAt,
        payload: null,
        error: "The Next.js API proxy could not be reached.",
      }
    }
  }

  const refreshServices = async () => {
    if (busyAction !== null) return
    setBusyAction("checking")
    setRunMessage("Checking the Backend Connection and Factory Services health...")
    const [configResult, healthResult] = await Promise.all([
      callDemoApi("config"),
      callDemoApi("health"),
    ])
    setConfigRequest(configResult)
    setHealthRequest(healthResult)
    setConfigPayload(configResult.payload)
    setHealthPayload(healthResult.payload)
    if (healthResult.upstreamResponded && healthResult.ok) {
      setRunMessage(`Services checked. Config HTTP ${configResult.httpStatus ?? "—"}; health HTTP ${healthResult.httpStatus ?? "—"}.`)
    } else {
      setRunMessage(healthResult.error ?? "Could not check factory services. Configure DEMO_API_BASE_URL and verify backend reachability.")
    }
    setBusyAction(null)
  }

  const executeStep = async (index: number) => {
    if (index === 2 && !disposition) {
      setCurrentStep(index)
      setRunMessage("Paused at Human Decision. Choose a disposition before executing workflow step 3.")
      return false
    }

    const stateBeforeStep = index === 0
      ? {}
      : workflowStateSnapshotsRef.current[index - 1] ?? workflowStateRef.current
    const stateForRequest = index === 2 && disposition
      ? { ...stateBeforeStep, humanDecision: disposition }
      : stateBeforeStep

    setCurrentStep(index)
    setRunMessage(`Running ${scenarioSteps[index].title} through the configured demo workflow...`)
    const request = await callDemoApi(`step/${index + 1}`, "POST", stateForRequest)
    const payload = isJsonObject(request.payload) ? request.payload : null
    const successful = isSuccessfulStepResponse(payload, request.ok)
    const execution: StepExecutionResult = {
      request,
      payload,
      successful,
      backendStatus: getBackendStatus(payload),
    }

    setStepResults((current) => {
      const next = { ...current, [index]: execution }
      for (const key of Object.keys(next)) if (Number(key) > index) delete next[Number(key)]
      return next
    })

    for (const key of Object.keys(workflowStateSnapshotsRef.current)) {
      if (Number(key) >= index) delete workflowStateSnapshotsRef.current[Number(key)]
    }

    if (!successful) {
      workflowStateRef.current = stateBeforeStep
      setCurrentStep(index)
      const status = request.httpStatus === null ? "No HTTP response" : `HTTP ${request.httpStatus}`
      setRunMessage(`${scenarioSteps[index].title} stopped (${status} · ${execution.backendStatus}). ${request.error ?? "The backend reported a failed or blocked step; downstream steps were not run."}`)
      return false
    }

    const updatedState = getUpdatedWorkflowState(payload, stateForRequest)
    workflowStateSnapshotsRef.current[index] = updatedState
    workflowStateRef.current = updatedState
    setCurrentStep(Math.min(index + 1, scenarioSteps.length - 1))
    setRunMessage(`${scenarioSteps[index].title} completed with a backend response (${request.httpStatus ? `HTTP ${request.httpStatus}` : "status unavailable"}).`)
    return true
  }

  const runSingleStep = async (index: number) => {
    if (busyAction !== null) return
    const prerequisiteMissing = scenarioSteps.slice(0, index).findIndex((_, previousIndex) => !stepResults[previousIndex]?.successful)
    if (prerequisiteMissing !== -1) {
      setCurrentStep(prerequisiteMissing)
      setRunMessage(`Run ${scenarioSteps[prerequisiteMissing].title} first. The workflow stops at the first incomplete or failed step.`)
      return
    }
    setBusyAction(index)
    try { await executeStep(index) } finally { setBusyAction(null) }
  }

  const runNextStep = () => {
    const nextStep = scenarioSteps.findIndex((_, index) => !stepResults[index]?.successful)
    if (nextStep === -1) {
      setCurrentStep(scenarioSteps.length - 1)
      setRunMessage("All five workflow steps have successful backend responses. Reset to start a fresh run.")
      return
    }
    void runSingleStep(nextStep)
  }

  const runAllSteps = async () => {
    if (busyAction !== null) return
    setBusyAction("all")
    const successfulSteps = new Set(Object.entries(stepResults).filter(([, result]) => result?.successful).map(([index]) => Number(index)))
    try {
      for (let index = 0; index < scenarioSteps.length; index += 1) {
        if (successfulSteps.has(index)) continue
        if (index === 2 && !disposition) {
          setCurrentStep(index)
          setRunMessage("Run All paused before Human Decision. Select a disposition, then run all again to continue.")
          return
        }
        const successful = await executeStep(index)
        if (!successful) return
        successfulSteps.add(index)
      }
      setCurrentStep(scenarioSteps.length - 1)
      setRunMessage("All five workflow steps completed with backend responses.")
    } finally {
      setBusyAction(null)
    }
  }

  const changeDisposition = (value: HumanDisposition | null) => {
    setDisposition(value)
    setRunMessage(value ? "Human disposition selected. It will be sent with workflow step 3 when you run it." : "Human disposition cleared; workflow step 3 will pause until one is selected.")
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setStepResults({})
    workflowStateRef.current = {}
    workflowStateSnapshotsRef.current = {}
    setDisposition(null)
    setRunMessage("Workflow reset in this browser. No backend reset endpoint is provided; the next run starts with an empty state object.")
    setActive("demo")
  }

  const openDemo = () => {
    if (!showCapstone) return setActive("overview")
    selectInitiative(TECHNICAL_FIXTURE_ID)
    setSearch("")
    setActive("demo")
    void refreshServices()
  }
  const openReadiness = () => {
    setActive("readiness")
  }
  const navigateTo = (view: ViewId) => {
    setSearch("")
    if (!showCapstone && (view === "demo" || view === "showcase")) return setActive("overview")
    if (view === "demo") return openDemo()
    if (view === "showcase") selectInitiative(TECHNICAL_FIXTURE_ID)
    if (view === "example") selectInitiative(CHEESECAKE_DEMO_ID)
    if ((view === "overview" || view === "F4") && selectedId === TECHNICAL_FIXTURE_ID) selectInitiative(null)
    if (view === "readiness") return openReadiness()
    setActive(view)
  }
  const completedSteps = Object.entries(stepResults).filter(([, result]) => result?.successful).map(([index]) => Number(index))
  const footerStatus = !healthRequest ? "SERVICE STATUS NOT CHECKED" : healthRequest.upstreamResponded ? healthRequest.ok ? "BACKEND HEALTH RESPONSE RECEIVED" : `BACKEND RESPONDED · HTTP ${healthRequest.httpStatus ?? "—"}` : "BACKEND UNAVAILABLE"
  const searchable = active === "overview" || active === "demo" || active === "showcase" || active === "evidence"
  const isRestaurantDemo = selectedId === CHEESECAKE_DEMO_ID
  const contextLabel = selectedDraft?.name ?? (isRestaurantDemo ? "The Cheesecake Factory — Demo Scenario" : selectedId === TECHNICAL_FIXTURE_ID ? "Technical Capstone · Original Test Fixture" : "COMRADII Workspace")
  const topbarContextLabel = isRestaurantDemo ? "Editable illustrative sandbox" : selectedDraft ? "Local planning draft" : selectedId === TECHNICAL_FIXTURE_ID ? "Technical test fixture" : "Initiative planning"
  const workspaceMode = isRestaurantDemo ? "FICTIONAL EXAMPLE SANDBOX" : selectedDraft ? "LOCAL PLANNING DRAFT" : selectedId === TECHNICAL_FIXTURE_ID ? "TECHNICAL TEST FIXTURE" : "YOUR PLANNING WORKSPACE"
  const searchPlaceholder = active === "overview" ? "Search overview..." : active === "demo" ? "Search demo steps..." : active === "showcase" ? "Search factory architecture..." : "Search API activity..."

  const content = !loaded ? (
    <div className="panel" role="status" aria-live="polite">Restoring your local planning workspace…</div>
  ) : active === "overview" ? (
    <OverviewPage
      onNavigate={navigateTo}
      onDemo={openDemo}
      onRefreshServices={() => { void refreshServices() }}
      searchTerm={search}
      disposition={disposition}
      stepResults={stepResults}
      configRequest={configRequest}
      healthRequest={healthRequest}
      healthPayload={healthPayload}
      refreshing={busyAction === "checking"}
      actionsDisabled={busyAction !== null}
    />
  ) : active === "readiness" ? (
    <ReadinessPage onNavigate={navigateTo} />
  ) : active === "performance" ? (
    <PerformanceOutcomesPage onNavigate={navigateTo} />
  ) : active === "people" ? (
    <PeopleResourcesPage onNavigate={navigateTo} />
  ) : active === "evidence" ? (
    <EvidenceActivityPage configRequest={configRequest} healthRequest={healthRequest} stepResults={stepResults} disposition={disposition} searchTerm={search} onNavigate={navigateTo} />
  ) : active === "showcase" && showCapstone ? (
    <CapstoneShowcasePage
      onNavigate={navigateTo}
      stepResults={stepResults}
      healthRequest={healthRequest}
      healthPayload={healthPayload}
      configRequest={configRequest}
      configPayload={configPayload}
      onRefreshServices={() => { void refreshServices() }}
      refreshing={busyAction === "checking"}
      actionsDisabled={busyAction !== null}
      searchTerm={search}
    />
  ) : active === "demo" && showCapstone ? (
    <GuidedDemoPage
      currentStep={currentStep}
      completedSteps={completedSteps}
      disposition={disposition}
      onDispositionChange={changeDisposition}
      onNavigate={navigateTo}
      onSelectStep={(step) => { setCurrentStep(step); setRunMessage(`Viewing ${scenarioSteps[step].title}. This selection alone does not run it.`) }}
      onRunNext={runNextStep}
      onRunStep={(step) => { void runSingleStep(step) }}
      onRunAll={runAllSteps}
      onReset={resetDemo}
      runMessage={runMessage}
      searchTerm={search}
      stepResults={stepResults}
      configRequest={configRequest}
      healthRequest={healthRequest}
      configPayload={configPayload}
      healthPayload={healthPayload}
      onRefreshServices={() => { void refreshServices() }}
      busy={busyAction !== null}
      refreshing={busyAction === "checking"}
      runningAll={busyAction === "all"}
      runningStep={typeof busyAction === "number" ? busyAction : null}
    />
  ) : active === "decision" ? (
    selectedDraft || selectedId !== TECHNICAL_FIXTURE_ID ? <PlanningDecisionPage onNavigate={navigateTo} /> : <HumanDecisionPage disposition={disposition} onDispositionChange={changeDisposition} onNavigate={navigateTo} />
  ) : active === "example" ? (
    <CheesecakeDemoPage onNavigate={navigateTo} />
  ) : active === "F4" ? (
    <InitiativesPage onNavigate={navigateTo} />
  ) : isFactoryView(active) ? (
    <FactoryPage factoryId={active} disposition={disposition} onNavigate={navigateTo} />
  ) : null

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={navigateTo} showCapstone={showCapstone} workspaceName={contextLabel} workspaceMode={workspaceMode} workspaceInitial={(selectedDraft?.name ?? "COMRADII").slice(0, 1).toUpperCase()} />
      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /><span /><span /></span><span className="mobile-brand-name">COMRADII</span>{isRestaurantDemo && <span className="mobile-demo-badge">ILLUSTRATIVE DEMO</span>}</div>
          <div className="breadcrumb"><span>{contextLabel}</span><span className="breadcrumb-slash">/</span><b>{viewLabels[active]}</b></div>
          <div className="topbar-actions">
            {searchable ? <label className="search-field"><Search size={16} aria-hidden="true" /><input aria-label="Search the current page" placeholder={searchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} />{search && <button type="button" className="search-clear" onClick={() => setSearch("")} aria-label="Clear search"><X size={13} aria-hidden="true" /></button>}</label> : <span className="topbar-workspace-label">{topbarContextLabel}</span>}
            <ThemeToggle />
          </div>
        </header>
        <nav className="mobile-nav" aria-label="Dashboard pages">
          {mobileLinks.filter(({ id }) => showCapstone || (id !== "showcase" && id !== "demo")).map(({ id, label }) => <button type="button" key={id} onClick={() => navigateTo(id)} className={active === id || (id === "F4" && active === "example") ? "selected" : ""} aria-current={active === id || (id === "F4" && active === "example") ? "page" : undefined}>{label}</button>)}
        </nav>
        <div className="content-area">
          {content}
          <footer className="main-footer"><span>© 2026 COMRADII <i>·</i> AI transformation planning</span>{["evidence", "showcase", "demo"].includes(active) && <span><span className={`footer-status-dot ${healthRequest ? healthRequest.upstreamResponded ? healthRequest.ok ? "connected" : "response" : "disconnected" : "unchecked"}`} /> {footerStatus}</span>}</footer>
        </div>
      </main>
      <FranklinChat pageId={active} />
    </div>
  )
}
