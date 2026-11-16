"use client"

import { useRef, useState } from "react"
import { Bell, ChevronDown, CircleHelp, Command, Search, X } from "lucide-react"
import { factories, scenarioSteps, type FactoryId, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
import { getApiError, getBackendStatus, getUpdatedWorkflowState, isJsonObject, isSuccessfulStepResponse, type ApiRequestResult, type JsonObject, type StepExecutionResult } from "@/lib/demo-api"
import { FactoryPage } from "./factory-page"
import { GuidedDemoPage } from "./guided-demo-page"
import { HumanDecisionPage } from "./human-decision-page"
import { OverviewPage } from "./overview-page"
import { DemoModeBanner } from "./shared"
import { Sidebar, viewLabels } from "./sidebar"

const isFactoryView = (view: ViewId): view is FactoryId => factories.some((factory) => factory.id === view)

export default function DashboardApp() {
  const [active, setActive] = useState<ViewId>("overview")
  const [search, setSearch] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [stepResults, setStepResults] = useState<Partial<Record<number, StepExecutionResult>>>({})
  const workflowStateRef = useRef<JsonObject>({})
  const [disposition, setDisposition] = useState<HumanDisposition | null>(null)
  const [runMessage, setRunMessage] = useState("Ready to connect to Julian's demo backend.")
  const [configRequest, setConfigRequest] = useState<ApiRequestResult | null>(null)
  const [healthRequest, setHealthRequest] = useState<ApiRequestResult | null>(null)
  const [configPayload, setConfigPayload] = useState<unknown>(null)
  const [healthPayload, setHealthPayload] = useState<unknown>(null)
  const [busyAction, setBusyAction] = useState<"checking" | "all" | number | null>(null)

  const callDemoApi = async (path: string, method: "GET" | "POST" = "GET", state?: JsonObject): Promise<ApiRequestResult> => {
    const startedAt = performance.now()
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
        payload: null,
        error: "The Next.js API proxy could not be reached.",
      }
    }
  }

  const refreshServices = async () => {
    if (busyAction !== null) return
    setBusyAction("checking")
    setRunMessage("Checking backend configuration and factory health...")
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

    const stateForRequest = index === 2 && disposition
      ? { ...workflowStateRef.current, humanDecision: disposition }
      : workflowStateRef.current
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

    if (!successful) {
      setCurrentStep(index)
      const status = request.httpStatus === null ? "No HTTP response" : `HTTP ${request.httpStatus}`
      setRunMessage(`${scenarioSteps[index].title} stopped (${status} · ${execution.backendStatus}). ${request.error ?? "The backend reported a failed or blocked step; downstream steps were not run."}`)
      return false
    }

    const updatedState = getUpdatedWorkflowState(payload, stateForRequest)
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
    setDisposition(null)
    setRunMessage("Workflow reset in this browser. No backend reset endpoint is provided; the next run starts with an empty state object.")
    setActive("demo")
  }

  const openDemo = () => {
    setActive("demo")
    void refreshServices()
  }
  const completedSteps = Object.entries(stepResults).filter(([, result]) => result?.successful).map(([index]) => Number(index))
  const footerStatus = !healthRequest ? "BACKEND NOT CHECKED" : healthRequest.upstreamResponded && healthRequest.ok ? `SERVICES CHECKED · HTTP ${healthRequest.httpStatus}` : "BACKEND UNAVAILABLE"

  const content = active === "overview" ? (
    <OverviewPage onNavigate={setActive} onDemo={openDemo} searchTerm={search} />
  ) : active === "demo" ? (
      <GuidedDemoPage
        currentStep={currentStep}
        completedSteps={completedSteps}
        disposition={disposition}
        onDispositionChange={changeDisposition}
        onNavigate={setActive}
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
      />
  ) : active === "decision" ? (
    <HumanDecisionPage disposition={disposition} onDispositionChange={changeDisposition} onNavigate={setActive} />
  ) : isFactoryView(active) ? (
    <FactoryPage factoryId={active} disposition={disposition} onNavigate={setActive} />
  ) : null

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={(view) => view === "demo" ? openDemo() : setActive(view)} onDemo={openDemo} />
      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark"><span /><span /><span /></span><span>cogsyne<span className="brand-period">.</span></span></div>
          <div className="breadcrumb"><span>Atlas Biotech</span><span className="breadcrumb-slash">/</span><b>{viewLabels[active]}</b><ChevronDown size={14} /><span className="top-demo-label">DEMO MODE</span></div>
          <div className="topbar-actions">
            <label className="search-field"><Search size={16} /><input aria-label="Search factories and demo steps" placeholder="Search this page..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd><Command size={11} /> K</kbd>{search && <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search"><X size={13} /></button>}</label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
            <button className="help-button"><CircleHelp size={16} /><span>Help</span></button>
            <span className="top-demo-label mobile-demo-label">DEMO MODE</span>
            <span className="top-avatar">JM</span>
          </div>
        </header>
        <div className="mobile-nav" aria-label="Dashboard pages">
          {(["overview", "F4", "F6", "decision", "F1", "F11", "demo"] as ViewId[]).map((id) => <button key={id} onClick={() => id === "demo" ? openDemo() : setActive(id)} className={active === id ? "selected" : ""}>{viewLabels[id]}</button>)}
        </div>
        <DemoModeBanner />
        <div className="content-area">
          {content}
          <footer className="main-footer"><span>© 2026 Cogsyne <i>·</i> Factory workflow demo</span><span><span className="footer-status-dot" /> DEMO MODE <i>·</i> {footerStatus}</span></footer>
        </div>
      </main>
    </div>
  )
}
