import { Check, Circle, Clock3, FileText, ShieldAlert } from "lucide-react"
import type { Status } from "@/lib/founder-demo-data"

export function StatusBadge({ status }: { status: Status | string }) {
  const variant = status.toLowerCase().replaceAll(" ", "-")
  const Icon = status === "Verified" || status === "Complete" || status === "Ready" ? Check : status === "In review" ? Clock3 : status === "Needs attention" || status === "Open" ? ShieldAlert : Circle
  return <span className={`status-badge status-${variant}`}><Icon size={12} strokeWidth={2.2} />{status}</span>
}

export function DataTable({ headers, children, empty = "No matching records" }: { headers: string[]; children: React.ReactNode; empty?: string }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table>{!children && <div className="table-empty"><FileText size={18} />{empty}</div>}</div>
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="detail-heading"><div><div className="overline section-eyebrow">{eyebrow}<span className="demo-chip">DEMO DATA</span></div><h1>{title}</h1><p className="page-subtitle">{description}</p></div>{action}</div>
}
