"use client"

import { ArrowUpRight, BriefcaseBusiness, Factory, Gauge, GitBranch, LayoutDashboard, LifeBuoy, Settings2, ShieldCheck, Sparkles } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"

const links: { id: ViewId; label: string; icon: typeof LayoutDashboard; number?: string }[] = [
  { id: "overview", label: "Enterprise overview", icon: LayoutDashboard },
  { id: "F4", label: "Project", icon: BriefcaseBusiness, number: "F4" },
  { id: "F6", label: "Performance", icon: Gauge, number: "F6" },
  { id: "decision", label: "Human Decision", icon: GitBranch },
  { id: "F1", label: "People Assurance", icon: ShieldCheck, number: "F1" },
  { id: "F11", label: "Talent Assurance", icon: Factory, number: "F11" },
  { id: "demo", label: "Guided Demo", icon: Sparkles },
]

export const viewLabels: Record<ViewId, string> = {
  overview: "Enterprise overview",
  F4: "F4 · Project",
  F6: "F6 · Performance",
  decision: "Human Decision",
  F1: "F1 · People Assurance",
  F11: "F11 · Talent Assurance & Marketplace",
  demo: "Guided Demo",
}

export function Sidebar({ active, onNavigate, onDemo }: { active: ViewId; onNavigate: (id: ViewId) => void; onDemo: () => void }) {
  return (
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => onNavigate("overview")} aria-label="Cogsyne home">
        <span className="brand-mark"><span /><span /><span /></span>
        <span className="brand-name">cogsyne<span className="brand-period">.</span></span>
      </button>
      <div className="workspace-switcher">
        <span className="workspace-avatar">A</span>
        <span className="workspace-copy"><b>Atlas Biotech</b><small>DEMO MODE</small></span>
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
      <button className="demo-launch" onClick={onDemo} aria-current={active === "demo" ? "page" : undefined}>
        <span className="demo-launch-icon"><Sparkles size={16} /></span>
        <span><b>Guided demo</b><small>Run the five-step story</small></span>
        <ArrowUpRight size={14} />
      </button>
      <div className="nav-divider" />
      <button className="nav-link quiet"><Settings2 size={17} strokeWidth={1.8} /><span>Workspace settings</span></button>
      <button className="nav-link quiet"><LifeBuoy size={17} strokeWidth={1.8} /><span>Help &amp; support</span></button>
      <div className="profile-row">
        <span className="profile-avatar">JM</span>
        <span className="profile-copy"><b>Jordan Miller</b><small>DEMO PROFILE · ADMIN</small></span>
        <span className="profile-menu">•••</span>
      </div>
    </aside>
  )
}
