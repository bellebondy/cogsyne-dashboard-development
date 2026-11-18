export type FactoryId = "F4" | "F6" | "F1" | "F11"
export const CHEESECAKE_DEMO_ID = "cheesecake-demo"
export const TECHNICAL_FIXTURE_ID = "technical-test-fixture"
export type DemoStepId = FactoryId | "decision"
export type ViewId = "overview" | "readiness" | "performance" | "people" | "evidence" | "showcase" | "demo" | "decision" | "example" | FactoryId
export type DataSource = "SIMULATED" | "LIVE"
export type HumanDisposition = "proceed" | "request-evidence" | "hold"

export type Factory = {
  id: FactoryId
  name: string
  team: "Team 1" | "Team 2"
  role: string
  description: string
  color: "purple" | "teal" | "coral" | "yellow"
}

export const factories: Factory[] = [
  { id: "F4", name: "Project", team: "Team 2", role: "Initiative definition", description: "Set the objective, baseline, and target for the scenario.", color: "purple" },
  { id: "F6", name: "Performance", team: "Team 2", role: "Performance measurement", description: "Compare the simulated observed result against the target.", color: "teal" },
  { id: "F1", name: "People Assurance", team: "Team 1", role: "Qualification assessment", description: "Assess a simulated qualification claim against the scenario evidence.", color: "coral" },
  { id: "F11", name: "Talent Assurance & Marketplace", team: "Team 1", role: "Talent recommendation", description: "Show a recommendation, execution boundary, and Recognition fixture.", color: "yellow" },
]

export const demoScenario = {
  objective: "Reduce average case handling time while preserving human review.",
  baselineMinutes: 10,
  targetMinutes: 8,
  observedMinutes: 9,
  qualificationClaim: "The team can consistently meet the 8-minute-per-case target while preserving required review.",
  assessment: "The claim is not established by this scenario fixture: the simulated observation is 9 minutes per case against an 8-minute target. This is not a certification or a live factory assessment.",
  recommendation: "Route the talent recommendation for human review. Do not execute a hire or assignment.",
  expectedExecutionDenial: "HTTP 403 is the expected execution-denial outcome in this scenario. It is not an observed response; no request has been sent.",
  recognitionRecord: {
    reference: "SIM-REC-001",
    type: "Recognition",
    capability: "Case-efficiency improvement capability",
    status: "SIMULATED scenario record",
    guardrail: "Recognition is NOT a hire or assignment.",
  },
} as const

export const humanDispositions: { value: HumanDisposition; label: string; description: string }[] = [
  { value: "proceed", label: "Continue to workforce review", description: "Carry the simulated finding forward. This does not authorize execution." },
  { value: "request-evidence", label: "Request more evidence", description: "Pause the recommendation while additional evidence is gathered." },
  { value: "hold", label: "Hold for review", description: "Pause the scenario pending another human review." },
]

export function getHumanDispositionLabel(value: HumanDisposition | null) {
  return humanDispositions.find((option) => option.value === value)?.label ?? "Not selected"
}

export const scenarioSteps: { id: DemoStepId; title: string; subtitle: string; description: string; view: ViewId }[] = [
  { id: "F4", title: "F4 Project", subtitle: "Team 2 · Project", description: "Define the initiative objective and 10-to-8-minute target.", view: "F4" },
  { id: "F6", title: "F6 Performance", subtitle: "Team 2 · Performance", description: "Observe 9 minutes per case and make the 1-minute gap visible.", view: "F6" },
  { id: "decision", title: "Human Decision", subtitle: "Human disposition", description: "Choose a local demo disposition before proceeding downstream.", view: "decision" },
  { id: "F1", title: "F1 People Assurance", subtitle: "Team 1 · People Assurance", description: "Assess the simulated qualification claim against the finding.", view: "F1" },
  { id: "F11", title: "F11 Talent", subtitle: "Team 1 · Talent Assurance & Marketplace", description: "Show the recommendation, expected denial, and Recognition fixture.", view: "F11" },
]
