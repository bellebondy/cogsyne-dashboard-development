"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Bell, ChevronDown, CircleHelp, Command, Search, X } from "lucide-react"
import { factories, type FactoryId } from "@/lib/founder-demo-data"
import { FactoryPage } from "./factory-page"
import { OverviewPage } from "./overview-page"
import { Sidebar, type ViewId } from "./sidebar"

const headings: Record<ViewId, string> = { overview: "Enterprise overview", F1: "Qualification", F6: "Evidence library", F11: "Sourcing", F12: "Founder readiness" }

export default function DashboardApp() {
  const [active, setActive] = useState<ViewId>("overview")
  const [search, setSearch] = useState("")
  const [demoOpen, setDemoOpen] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const content = useMemo(() => active === "overview" ? <OverviewPage onNavigate={setActive} onDemo={() => { setDemoStep(0); setDemoOpen(true) }} searchTerm={search} /> : <FactoryPage factoryId={active as FactoryId} searchTerm={search} onNavigate={setActive} onDemo={() => { setDemoStep(0); setDemoOpen(true) }} />, [active, search])
  const demoSteps = [
    { title: "Start with qualification", text: "F1 tracks provider capabilities against explicit criteria. Its records inform sourcing and readiness decisions.", target: "F1" as ViewId, label: "Open F1 · Qualification" },
    { title: "Trace every evidence record", text: "F6 keeps source details, validation state, and the factory requirements each record supports.", target: "F6" as ViewId, label: "Open F6 · Evidence" },
    { title: "Close the right gaps", text: "When readiness highlights a sourcing gap, F11 turns it into an owned recommendation and next action.", target: "F11" as ViewId, label: "Open F11 · Sourcing" },
    { title: "Bring the picture together", text: "F12 consumes F1 qualification and F6 evidence. It reflects open sourcing gaps while F11 uses F1 qualification.", target: "F12" as ViewId, label: "Open F12 · Readiness" },
  ]
  return <div className="app-shell"><Sidebar active={active} onNavigate={setActive} onDemo={() => { setDemoStep(0); setDemoOpen(true) }} />
    <main className="main-area"><header className="topbar"><div className="mobile-brand"><span className="brand-mark"><span /><span /><span /></span><span>cogsyne<span className="brand-period">.</span></span></div><div className="breadcrumb"><span>Atlas Biotech</span><span className="breadcrumb-slash">/</span><b>{headings[active]}</b><ChevronDown size={14} /><span className="top-demo-label">DEMO DATA</span></div><div className="topbar-actions"><label className="search-field"><Search size={16} /><input aria-label="Search current page" placeholder="Search this page..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd><Command size={11} /> K</kbd>{search && <button className="search-clear" onClick={() => setSearch("")} aria-label="Clear search"><X size={13} /></button>}</label><button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button><button className="help-button"><CircleHelp size={16} /><span>Help</span></button><span className="top-demo-label mobile-demo-label">DEMO DATA</span><span className="top-avatar">JM</span></div></header>
      <div className="mobile-nav" aria-label="Factory pages">{(["overview", "F1", "F6", "F11", "F12"] as ViewId[]).map((id) => <button key={id} onClick={() => setActive(id)} className={active === id ? "selected" : ""}>{id === "overview" ? "Overview" : `${id} · ${factories.find((factory) => factory.id === id)?.name}`}</button>)}</div>
      <div className="content-area">{content}<footer className="main-footer"><span>© 2026 Cogsyne <i>·</i> Founder readiness workspace</span><span><span className="footer-status-dot" /> DEMO ENVIRONMENT <i>·</i> Sample data only</span></footer></div>
    </main>
    {demoOpen && <div className="modal-backdrop demo-backdrop" role="presentation" onClick={() => setDemoOpen(false)}><section className="demo-modal" role="dialog" aria-modal="true" aria-labelledby="demo-title" onClick={(event) => event.stopPropagation()}><div className="demo-modal-head"><span className="demo-modal-icon"><CircleHelp size={20} /></span><button className="icon-button demo-close" onClick={() => setDemoOpen(false)} aria-label="Close guided demo"><X size={17} /></button></div><span className="overline">GUIDED PRODUCT TOUR · STEP {demoStep + 1} OF {demoSteps.length}</span><h2 id="demo-title">{demoSteps[demoStep].title}</h2><p>{demoSteps[demoStep].text}</p><div className="demo-step-meta"><span>{demoSteps[demoStep].target}</span><span>{demoSteps[demoStep].label.replace(/^Open /, "Explore ")}</span></div><div className="demo-stepper" role="progressbar" aria-label="Guided demo progress" aria-valuemin={1} aria-valuemax={demoSteps.length} aria-valuenow={demoStep + 1}>{demoSteps.map((step, index) => <span key={step.target} aria-hidden="true" className={index === demoStep ? "current" : index < demoStep ? "visited" : ""} />)}</div><div className="demo-modal-actions"><button className="button button-quiet" onClick={() => setDemoOpen(false)}>Exit tour</button><div>{demoStep > 0 && <button className="button button-outline" onClick={() => setDemoStep((step) => step - 1)}>Back</button>}<button className="button button-dark" onClick={() => { setActive(demoSteps[demoStep].target); if (demoStep < demoSteps.length - 1) setDemoStep((step) => step + 1); else setDemoOpen(false) }}>{demoStep === demoSteps.length - 1 ? "Finish tour" : "Next step"}<ArrowRight size={14} /></button></div></div></section></div>}
  </div>
}
