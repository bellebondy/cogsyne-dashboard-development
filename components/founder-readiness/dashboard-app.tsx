"use client"

import { useState } from "react"
import { Bell, ChevronDown, CircleHelp, Command, Search, X } from "lucide-react"
import { factories, scenarioSteps, type FactoryId, type HumanDisposition, type ViewId } from "@/lib/founder-demo-data"
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
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [disposition, setDisposition] = useState<HumanDisposition | null>(null)
  const [runMessage, setRunMessage] = useState("Ready to run the first simulated step.")

  const changeDisposition = (value: HumanDisposition | null) => {
    setDisposition(value)
    setRunMessage(value ? "A simulated human disposition is selected locally. No API call was made." : "The simulated human disposition was cleared.")
  }

  const runNextStep = () => {
    const nextStep = scenarioSteps.findIndex((_, index) => !completedSteps.includes(index))
    if (nextStep === -1) {
      setCurrentStep(scenarioSteps.length - 1)
      setRunMessage("All five simulated steps are complete. Reset to replay; no API calls were made.")
      return
    }
    setCurrentStep(nextStep)
    if (nextStep === 2 && !disposition) {
      setRunMessage("The demo is paused at Human Decision. Choose a disposition before continuing.")
      return
    }
    const nextCompleted = [...new Set([...completedSteps, nextStep])]
    setCompletedSteps(nextCompleted)
    if (nextStep === scenarioSteps.length - 1) {
      setRunMessage("All five simulated steps are complete. No factory APIs were called.")
      return
    }
    setCurrentStep(nextStep + 1)
    setRunMessage(`${scenarioSteps[nextStep].title} ran as a local simulation. Next: ${scenarioSteps[nextStep + 1].title}.`)
  }

  const runAllSteps = () => {
    if (!disposition) {
      setCompletedSteps([0, 1])
      setCurrentStep(2)
      setRunMessage("Run All completed the F4 and F6 scenario fixtures, then paused for your Human Decision. No API calls were made.")
      return
    }
    setCompletedSteps(scenarioSteps.map((_, index) => index))
    setCurrentStep(scenarioSteps.length - 1)
    setRunMessage("All five steps ran as local simulations. No factory APIs were called.")
  }

  const resetDemo = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setDisposition(null)
    setRunMessage("Demo reset. No steps have been run.")
    setActive("demo")
  }

  const content = active === "overview" ? (
    <OverviewPage onNavigate={setActive} onDemo={() => setActive("demo")} searchTerm={search} />
  ) : active === "demo" ? (
    <GuidedDemoPage
      currentStep={currentStep}
      completedSteps={completedSteps}
      disposition={disposition}
      onDispositionChange={changeDisposition}
      onNavigate={setActive}
      onSelectStep={(step) => { setCurrentStep(step); setRunMessage(`Viewing ${scenarioSteps[step].title}. This selection alone does not run it.`) }}
      onRunNext={runNextStep}
      onRunAll={runAllSteps}
      onReset={resetDemo}
      runMessage={runMessage}
      searchTerm={search}
    />
  ) : active === "decision" ? (
    <HumanDecisionPage disposition={disposition} onDispositionChange={changeDisposition} onNavigate={setActive} />
  ) : isFactoryView(active) ? (
    <FactoryPage factoryId={active} disposition={disposition} onNavigate={setActive} />
  ) : null

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={setActive} onDemo={() => setActive("demo")} />
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
          {(["overview", "F4", "F6", "decision", "F1", "F11", "demo"] as ViewId[]).map((id) => <button key={id} onClick={() => setActive(id)} className={active === id ? "selected" : ""}>{viewLabels[id]}</button>)}
        </div>
        <DemoModeBanner />
        <div className="content-area">
          {content}
          <footer className="main-footer"><span>© 2026 Cogsyne <i>·</i> Factory workflow demo</span><span><span className="footer-status-dot" /> DEMO MODE <i>·</i> No API calls made</span></footer>
        </div>
      </main>
    </div>
  )
}
