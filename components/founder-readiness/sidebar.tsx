"use client"

import { ArrowUpRight, Compass, Factory, FileCheck2, LayoutDashboard, LifeBuoy, Settings2, Sparkles } from "lucide-react"
import type { FactoryId } from "@/lib/founder-demo-data"

export type ViewId = "overview" | FactoryId

const links: { id: ViewId; label: string; icon: typeof LayoutDashboard; number?: string }[] = [
  { id: "overview", label: "Enterprise overview", icon: LayoutDashboard },
  { id: "F1", label: "Qualification", icon: Factory, number: "F1" },
  { id: "F6", label: "Evidence library", icon: FileCheck2, number: "F6" },
  { id: "F11", label: "Sourcing gaps", icon: Compass, number: "F11" },
  { id: "F12", label: "Founder readiness", icon: Sparkles, number: "F12" },
]

export function Sidebar({ active, onNavigate, onDemo }: { active: ViewId; onNavigate: (id: ViewId) => void; onDemo: () => void }) {
  return (
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => onNavigate("overview")} aria-label="Cogsyne home">
        <span className="brand-mark"><span /><span /><span /></span>
        <span className="brand-name">cogsyne<span className="brand-period">.</span></span>
      </button>
      <div className="workspace-switcher">
        <span className="workspace-avatar">A</span>
        <span className="workspace-copy"><b>Atlas Biotech</b><small>DEMO WORKSPACE</small></span>
        <ArrowUpRight size={15} aria-hidden="true" />
      </div>
      <div className="nav-section-label">WORKSPACE</div>
      <nav aria-label="Main navigation" className="side-nav">
        {links.map(({ id, label, icon: Icon, number }) => (
          <button key={id} onClick={() => onNavigate(id)} className={`nav-link ${active === id ? "active" : ""}`} data-factory={number} aria-current={active === id ? "page" : undefined}>
            <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
            {number && <span className="nav-code">{number}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <button className="demo-launch" onClick={onDemo}>
        <span className="demo-launch-icon"><Sparkles size={16} /></span>
        <span><b>Guided demo</b><small>Explore the workflow</small></span>
        <ArrowUpRight size={14} />
      </button>
      <div className="nav-divider" />
      <button className="nav-link quiet"><Settings2 size={17} strokeWidth={1.8} /><span>Workspace settings</span></button>
      <button className="nav-link quiet"><LifeBuoy size={17} strokeWidth={1.8} /><span>Help & support</span></button>
      <div className="profile-row">
        <span className="profile-avatar">JM</span>
        <span className="profile-copy"><b>Jordan Miller</b><small>DEMO PROFILE · ADMIN</small></span>
        <span className="profile-menu">•••</span>
      </div>
    </aside>
  )
}
