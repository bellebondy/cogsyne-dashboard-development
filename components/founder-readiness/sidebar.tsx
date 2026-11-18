"use client"

import { BriefcaseBusiness, FileText, Gauge, LayoutDashboard, Network, ShieldCheck, UserRoundCheck, Users, Workflow, type LucideIcon } from "lucide-react"
import type { ViewId } from "@/lib/founder-demo-data"

export const businessLinks: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "F4", label: "AI Initiatives", icon: BriefcaseBusiness },
  { id: "performance", label: "Performance & Outcomes", icon: Gauge },
  { id: "readiness", label: "Readiness & Assurance", icon: ShieldCheck },
  { id: "decision", label: "Decisions & Actions", icon: UserRoundCheck },
  { id: "people", label: "People & Resources", icon: Users },
  { id: "evidence", label: "Evidence & Activity", icon: FileText },
]

export const capstoneLinks: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: "showcase", label: "Capstone Showcase", icon: Network },
  { id: "demo", label: "Five-step API demo", icon: Workflow },
]

export const mobileLinks = [...businessLinks, ...capstoneLinks]

export const viewLabels: Record<ViewId, string> = {
  overview: "Overview",
  example: "The Cheesecake Factory demo",
  readiness: "Readiness & Assurance",
  performance: "Performance & Outcomes",
  people: "People & Resources",
  evidence: "Evidence & Activity",
  showcase: "Capstone Showcase",
  F4: "AI Initiatives",
  F6: "Performance & Outcomes",
  decision: "Decisions & Actions",
  F1: "People & Resources",
  F11: "Talent & Resource Recommendations",
  demo: "Five-step API demo",
  "capstone-F4": "F4 Project · Technical Capstone",
  "capstone-F6": "F6 Performance · Technical Capstone",
  "capstone-F1": "F1 People · Technical Capstone",
  "capstone-F11": "F11 Talent · Technical Capstone",
  "capstone-decision": "Human Decision · Technical Capstone",
  "capstone-evidence": "Evidence & Activity · Technical Capstone",
  "customer-initiatives": "AI Initiatives",
}

function NavigationLinks({ links, active, onNavigate }: { links: typeof businessLinks; active: ViewId; onNavigate: (id: ViewId) => void }) {
  return links.map(({ id, label, icon: Icon }) => {
    const isActive = active === id || (id === "F4" && active === "example") || (id === "F1" && active === "F11") || (id === "demo" && typeof active === "string" && active.startsWith("capstone-"))
    return (
      <button key={id} onClick={() => onNavigate(id)} className={`nav-link ${isActive ? "active" : ""}`} aria-current={isActive ? "page" : undefined}>
        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
        <span>{label}</span>
      </button>
    )
  })
}

export function Sidebar({ active, onNavigate, showCapstone, workspaceName, workspaceMode, workspaceInitial }: { active: ViewId; onNavigate: (id: ViewId) => void; showCapstone: boolean; workspaceName: string; workspaceMode: string; workspaceInitial: string }) {
  return (
    <aside className="sidebar">
      <button className="brand-lockup" onClick={() => onNavigate("overview")} aria-label="COMRADII home">
        <span className="brand-mark"><span /><span /><span /></span>
        <span className="brand-name">COMRADII</span>
      </button>
      <div className="workspace-switcher" aria-label={`Current workspace: ${workspaceName}`}>
        <span className="workspace-avatar" aria-hidden="true">{workspaceInitial}</span>
        <span className="workspace-copy"><b>{workspaceName}</b><small>{workspaceMode}</small></span>
      </div>
      <div className="nav-section-label">YOUR WORKSPACE</div>
      <nav aria-label="Business workspace" className="side-nav">
        <NavigationLinks links={businessLinks} active={active} onNavigate={onNavigate} />
      </nav>
      {showCapstone && <>
        <div className="sidebar-spacer" />
        <div className="nav-divider" />
        <div className="nav-section-label">CAPSTONE SHOWCASE</div>
        <nav aria-label="Capstone showcase" className="side-nav">
          <NavigationLinks links={capstoneLinks} active={active} onNavigate={onNavigate} />
        </nav>
      </>}
      <div className="sidebar-spacer" />
    </aside>
  )
}
