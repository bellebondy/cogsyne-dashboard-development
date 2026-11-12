export type FactoryId = "F1" | "F6" | "F11" | "F12"
export type Status = "Ready" | "In review" | "Needs attention" | "Draft" | "Verified" | "Open" | "Complete"

export type Factory = {
  id: FactoryId
  name: string
  eyebrow: string
  description: string
  status: Status
  progress: number
  owner: string
  color: string
}

export const factories: Factory[] = [
  { id: "F1", name: "Qualification", eyebrow: "PROVIDER CAPABILITIES", description: "Qualification criteria and provider records", status: "In review", progress: 68, owner: "Team North", color: "mint" },
  { id: "F6", name: "Evidence", eyebrow: "EVIDENCE LIBRARY", description: "Validated evidence with clear traceability", status: "Ready", progress: 84, owner: "Team North", color: "blue" },
  { id: "F11", name: "Sourcing", eyebrow: "GAP RESOLUTION", description: "Recommendations to close readiness gaps", status: "Needs attention", progress: 42, owner: "Team South", color: "amber" },
  { id: "F12", name: "Founder Readiness", eyebrow: "READINESS SUMMARY", description: "A connected view of founder readiness", status: "In review", progress: 71, owner: "Team South", color: "violet" },
]

export const qualificationRecords = [
  { name: "Clinical manufacturing", category: "Operations", criteria: "GMP-aligned facility, 3+ commercial batches", owner: "Team North", status: "Verified" as Status, updated: "Oct 24, 2026" },
  { name: "Regulatory strategy", category: "Regulatory", criteria: "FDA pathway and submission plan documented", owner: "Team North", status: "In review" as Status, updated: "Oct 21, 2026" },
  { name: "Quality systems", category: "Quality", criteria: "QMS scope, audit history, and CAPA process", owner: "Team South", status: "Needs attention" as Status, updated: "Oct 19, 2026" },
  { name: "Analytical development", category: "Technical", criteria: "Validated methods with transfer capability", owner: "Team North", status: "Verified" as Status, updated: "Oct 17, 2026" },
  { name: "Supply continuity", category: "Operations", criteria: "Documented continuity and second-source plan", owner: "Team South", status: "Draft" as Status, updated: "Oct 12, 2026" },
]

export const evidenceRecords = [
  { name: "GMP facility assessment", source: "Northstar Bio · Site audit", type: "Assessment", status: "Verified" as Status, date: "Oct 24, 2026", linked: "F1 · Clinical manufacturing" },
  { name: "Regulatory pathway memo", source: "Internal · Regulatory team", type: "Memo", status: "In review" as Status, date: "Oct 21, 2026", linked: "F1 · Regulatory strategy" },
  { name: "Analytical method report", source: "Meridian Labs · Technical file", type: "Report", status: "Verified" as Status, date: "Oct 17, 2026", linked: "F1 · Analytical development" },
  { name: "Founder team capability map", source: "Internal · Founder team", type: "Framework", status: "Draft" as Status, date: "Oct 15, 2026", linked: "F12 · Team" },
  { name: "Supply continuity questionnaire", source: "Northstar Bio · Questionnaire", type: "Questionnaire", status: "Open" as Status, date: "Oct 12, 2026", linked: "F11 · Continuity plan" },
]

export const sourcingGaps = [
  { name: "Second-source strategy", impact: "High", recommendation: "Identify an alternate qualified supplier for key materials.", owner: "Team South", status: "Open" as Status, due: "Nov 14, 2026" },
  { name: "QMS audit documentation", impact: "High", recommendation: "Request the latest audit summary and CAPA evidence.", owner: "Team North", status: "In review" as Status, due: "Nov 18, 2026" },
  { name: "Regulatory submission owner", impact: "Medium", recommendation: "Confirm accountable lead and target submission window.", owner: "Team South", status: "Open" as Status, due: "Nov 22, 2026" },
  { name: "Founder commercial experience", impact: "Medium", recommendation: "Add a supporting record for commercial launch experience.", owner: "Team South", status: "Complete" as Status, due: "Nov 06, 2026" },
]

export const readinessRequirements = [
  { name: "Qualified provider for clinical manufacturing", source: "F1 · Clinical manufacturing", status: "Complete" as Status, evidence: "GMP facility assessment" },
  { name: "Regulatory pathway and accountable owner", source: "F1 · Regulatory strategy", status: "In review" as Status, evidence: "Regulatory pathway memo" },
  { name: "Quality systems and audit readiness", source: "F1 · Quality systems", status: "Open" as Status, evidence: "Audit summary requested" },
  { name: "Supply continuity plan", source: "F11 · Second-source strategy", status: "Open" as Status, evidence: "Recommendation in progress" },
  { name: "Founder team capability evidence", source: "F6 · Founder team map", status: "Complete" as Status, evidence: "Founder team capability map" },
]

export const activityItems = [
  { initials: "JT", color: "teal", title: "Evidence validated", detail: "GMP facility assessment · F6", time: "24 min ago" },
  { initials: "ML", color: "blue", title: "Qualification updated", detail: "Regulatory strategy · F1", time: "2 hours ago" },
  { initials: "AR", color: "violet", title: "Sourcing gap identified", detail: "Second-source strategy · F11", time: "Yesterday" },
]
