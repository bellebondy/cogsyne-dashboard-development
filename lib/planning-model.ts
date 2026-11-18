import { CHEESECAKE_DEMO_ID } from "@/lib/founder-demo-data"

export const assessmentAreas = [
  { id: "people", label: "People & Skills", why: "Identify the people who will use, oversee, and be affected by the proposed AI.", evidence: ["Roles and skills involved", "Training, guidance, and human oversight"] },
  { id: "processes", label: "Processes & Operations", why: "Understand the current workflow and where people need to review or override AI output.", evidence: ["How the process works today", "Review, handoff, and override steps"] },
  { id: "product", label: "Product, Technology & Information", why: "Clarify what the product should do and what systems or information it may need.", evidence: ["Intended use and product requirements", "Data, integration, and quality needs"] },
  { id: "delivery", label: "Project Planning", why: "Name an owner, practical milestones, resources, and dependencies.", evidence: ["Owner, milestones, and dependencies", "Change and rollout considerations"] },
  { id: "performance", label: "Performance & Business Value", why: "Define a business outcome and how you might measure it.", evidence: ["Baseline and target, if known", "Measurement source and review period"] },
  { id: "security", label: "Security & Risk", why: "Identify sensitive information, potential harms, and the people who should review risk.", evidence: ["Data sensitivity and access needs", "Potential risks and review owners"] },
] as const

export type AssessmentAreaId = (typeof assessmentAreas)[number]["id"]

export type ReadinessQuestion = {
  id: string
  areaId: AssessmentAreaId
  prompt: string
  help: string
  example: string
  input: "textarea" | "select"
  options?: string[]
}

export const readinessQuestions: ReadinessQuestion[] = [
  { id: "people-users", areaId: "people", prompt: "Who will use or oversee this AI system?", help: "Think about roles, not just the person sponsoring the idea.", example: "Operations managers who review a forecast before changing a shift plan.", input: "textarea" },
  { id: "people-training", areaId: "people", prompt: "Will employees need training or guidance?", help: "Consider how people will understand the tool's limits and know when to ask for help.", example: "A short guide to interpreting confidence ranges and escalating unusual forecasts.", input: "select", options: ["Yes, training will likely be needed", "Possibly — we need to learn more", "No additional training identified yet"] },
  { id: "people-review", areaId: "people", prompt: "Who should review AI-generated recommendations?", help: "Name an accountable role that can question or override an output.", example: "A manager responsible for the daily operating plan.", input: "textarea" },
  { id: "process-work", areaId: "processes", prompt: "What process are you hoping to improve?", help: "Describe the work in everyday language, including when it happens.", example: "Preparing staffing and food-preparation plans for expected busy periods.", input: "textarea" },
  { id: "process-current", areaId: "processes", prompt: "How does that process currently work?", help: "Outline the important steps, tools, handoffs, and manual workarounds.", example: "A manager reviews recent traffic, reservations, and local experience before planning.", input: "textarea" },
  { id: "process-override", areaId: "processes", prompt: "Can someone review or override an AI recommendation?", help: "A person should be able to consider local context rather than follow an output automatically.", example: "Yes. The duty manager reviews a forecast and records why they adjust the plan.", input: "select", options: ["Yes, a person will make the final decision", "Not yet — this needs to be designed", "Unsure — we need to investigate"] },
  { id: "product-purpose", areaId: "product", prompt: "What must the proposed AI product help people accomplish?", help: "State the task and intended users without assuming a particular vendor or solution.", example: "Estimate customer demand so a manager can compare it with a staffing plan.", input: "textarea" },
  { id: "product-systems", areaId: "product", prompt: "What systems or information might it need?", help: "List likely sources at a high level; do not include records, credentials, or confidential details.", example: "Aggregated order volume, reservation counts, and a calendar of local events.", input: "textarea" },
  { id: "product-quality", areaId: "product", prompt: "How will you determine whether its outputs are useful and reliable?", help: "Think about who will review outputs, what to compare them with, and how errors will be handled.", example: "Compare forecasts with observed demand over representative weeks and review large errors.", input: "textarea" },
  { id: "delivery-owner", areaId: "delivery", prompt: "Who will own this initiative?", help: "An accountable role helps coordinate questions and keep a plan moving.", example: "Operations director or an assigned initiative lead.", input: "textarea" },
  { id: "delivery-milestones", areaId: "delivery", prompt: "What are the main milestones?", help: "Start with a few review points, such as confirming requirements or evaluating a pilot plan.", example: "Document today's process, review information needs, then agree whether to scope a pilot.", input: "textarea" },
  { id: "delivery-resources", areaId: "delivery", prompt: "What resources or dependencies might affect the project?", help: "Consider people, time, systems, approvals, and other work that must happen first.", example: "A process owner, analyst time, data-owner input, and an approved testing environment.", input: "textarea" },
  { id: "performance-outcome", areaId: "performance", prompt: "What business outcome are you hoping to improve?", help: "Focus on the benefit to the business or the people it serves.", example: "Reduce avoidable customer waits without compromising service quality.", input: "textarea" },
  { id: "performance-measure", areaId: "performance", prompt: "How might you measure success?", help: "Choose a measure that reflects the outcome and can be gathered consistently.", example: "Average wait time alongside customer satisfaction and staffing coverage.", input: "textarea" },
  { id: "performance-baseline", areaId: "performance", prompt: "Do you have a current baseline?", help: "A baseline is a current measurement collected before a change; it is okay not to know yet.", example: "A weekly average from an agreed source, or 'not measured yet'.", input: "select", options: ["Yes, a current baseline is available", "No, we need to establish one", "Unsure — the measurement method needs review"] },
  { id: "security-sensitive", areaId: "security", prompt: "Will sensitive or personal information be involved?", help: "Consider what information could be used and whether it is appropriate for this purpose.", example: "We need to confirm whether aggregate information is sufficient before selecting any data.", input: "select", options: ["Possibly — this needs a privacy or security review", "No sensitive information is expected", "Unsure — information sources are not defined"] },
  { id: "security-harms", areaId: "security", prompt: "What could go wrong if the system or its information is wrong or misused?", help: "Think about operational, customer, employee, privacy, and security impacts.", example: "An inaccurate forecast could lead to poor coverage or unnecessary preparation.", input: "textarea" },
  { id: "security-reviewer", areaId: "security", prompt: "Who should review potential risks and safeguards?", help: "Identify the relevant business, privacy, security, or safety roles to consult.", example: "A business process owner with input from the organization's security contact.", input: "textarea" },
]

export type KpiSource = "user-entered" | "illustrative" | "backend-verified"
export type KpiStatus = "not-started" | "in-progress" | "on-track" | "needs-attention"
export type KpiDirection = "higher-is-better" | "lower-is-better"
export type InitiativeKpi = {
  id: string
  name: string
  description: string
  unit: string
  baseline: number | null
  target: number | null
  latestObserved: number | null
  measurementPeriod: string
  owner: string
  direction: KpiDirection
  status: KpiStatus
  source: KpiSource
}

export type StakeholderKind = "initiative-owner" | "business-sponsor" | "technical-contact" | "reviewer" | "other"
export type InitiativeStakeholder = {
  id: string
  name: string
  role: string
  kind: StakeholderKind
  responsibilities: string
  skills: string[]
}

export type SkillRequirement = {
  id: string
  name: string
  trainingConsideration: string
  status: "identified" | "training-needed" | "not-yet-assessed"
}

export type PlanningActionStatus = "todo" | "in-progress" | "waiting" | "completed"
export type PlanningActionPriority = "low" | "medium" | "high"
export type PlanningAction = {
  id: string
  title: string
  description: string
  priority: PlanningActionPriority
  owner: string
  dueDate: string
  status: PlanningActionStatus
  readinessArea?: AssessmentAreaId
  evidenceItemId?: string
}

export type EvidenceStatus = "not-requested" | "requested" | "provided-by-user" | "needs-review"
export type EvidenceCategory = "business" | "process" | "data" | "risk" | "testing" | "acceptance" | "stakeholder" | "outcomes" | "other"
export type PlanningEvidenceItem = {
  id: string
  title: string
  description: string
  category: EvidenceCategory
  requestedOwner: string
  status: EvidenceStatus
  notes: string
  reference: string
}

export type PlanningMilestone = {
  id: string
  title: string
  description: string
  dueDate: string
  status: "planned" | "in-progress" | "completed"
  owner: string
}

export type PlanningActivity = {
  id: string
  summary: string
  occurredAt: string
}

export type InitiativeDraft = {
  id: string
  name: string
  description: string
  goal: string
  objective: string
  department: string
  challenge: string
  currentProcess: string
  peopleImpacted: string
  intendedUse: string
  expectedBenefit: string
  successLooksLike: string
  peopleSkills: string
  resourceNeeds: string
  successMetric: string
  baseline: string
  target: string
  unit: string
  measurementPeriod: string
  assessmentAreas: AssessmentAreaId[]
  checklist: Partial<Record<AssessmentAreaId, boolean>>
  decisionNote: string
  nextStep: string
  readinessAnswers: Record<string, string>
  readinessNotes: Record<string, string>
  kpis: InitiativeKpi[]
  stakeholders: InitiativeStakeholder[]
  skills: SkillRequirement[]
  actions: PlanningAction[]
  evidence: PlanningEvidenceItem[]
  milestones: PlanningMilestone[]
  activity: PlanningActivity[]
  source: "user" | "illustrative"
  updatedAt: string
}

export type ReadinessSnapshot = {
  answered: number
  total: number
  completion: number
  areasReviewed: number
  areasComplete: number
  gaps: number
  areasNeedingReview: string[]
}

export type PlanningCompletion = {
  percent: number
  completed: number
  total: number
  stage: string
  nextSteps: string[]
}

export type FactoryFinding = {
  factoryId: string
  title: string
  status: "received" | "pending" | "unavailable"
  summary: string
  provenance: { source: string; receivedAt: string; reference?: string }
}

export type VerifiedEvidenceRecord = {
  evidenceId: string
  status: "verified" | "rejected" | "pending"
  verifiedBy: string
  verifiedAt: string
  sourceReference: string
}

export type GovernedHumanDecision = {
  disposition: string
  decisionMaker: string
  decidedAt: string
  rationale: string
  authorityReference: string
}

export type FactoryResultEnvelope = {
  factoryId: string
  resultId: string
  receivedAt: string
  provenance: string
  findings: FactoryFinding[]
  verifiedEvidence: VerifiedEvidenceRecord[]
}

export function getReadinessSnapshot(initiative: InitiativeDraft): ReadinessSnapshot {
  const answered = readinessQuestions.filter((question) => Boolean(initiative.readinessAnswers[question.id]?.trim())).length
  const areasReviewed = assessmentAreas.filter((area) => readinessQuestions.some((question) => question.areaId === area.id && Boolean(initiative.readinessAnswers[question.id]?.trim()))).length
  const areasComplete = assessmentAreas.filter((area) => readinessQuestions.filter((question) => question.areaId === area.id).every((question) => Boolean(initiative.readinessAnswers[question.id]?.trim()))).length
  const areasNeedingReview = assessmentAreas
    .filter((area) => readinessQuestions.some((question) => question.areaId === area.id && !initiative.readinessAnswers[question.id]?.trim()))
    .map((area) => area.label)
  return { answered, total: readinessQuestions.length, completion: Math.round((answered / readinessQuestions.length) * 100), areasReviewed, areasComplete, gaps: readinessQuestions.length - answered, areasNeedingReview }
}

export function getPlanningCompletion(initiative: InitiativeDraft): PlanningCompletion {
  const snapshot = getReadinessSnapshot(initiative)
  const checks = [
    Boolean(initiative.objective.trim() || initiative.goal.trim()) && Boolean(initiative.challenge.trim()),
    snapshot.answered === snapshot.total,
    initiative.kpis.length > 0,
    initiative.stakeholders.length > 0,
    initiative.actions.length > 0,
    initiative.evidence.length > 0,
    initiative.milestones.length > 0,
  ]
  const completed = checks.filter(Boolean).length
  const stage = !checks[0] ? "Opportunity framing" : !checks[1] ? "Readiness planning" : !checks[2] ? "Outcome planning" : !checks[3] || !checks[4] ? "People and actions" : !checks[5] || !checks[6] ? "Evidence and milestones" : "Planning review"
  const nextSteps = [
    !checks[0] ? "Clarify the business outcome and the problem you want to solve." : null,
    !checks[1] ? `Answer ${snapshot.gaps} remaining readiness planning question${snapshot.gaps === 1 ? "" : "s"}.` : null,
    !checks[2] ? "Define at least one KPI with a baseline, target, and measurement owner where known." : null,
    !checks[3] ? "Identify the initiative owner and the people who should review the work." : null,
    !checks[4] ? "Add a planning action with an owner or due date." : null,
    !checks[5] ? "List information or evidence that should be gathered." : null,
    !checks[6] ? "Add a milestone to make the next review point visible." : null,
  ].filter((value): value is string => Boolean(value))
  return { percent: Math.round((completed / checks.length) * 100), completed, total: checks.length, stage, nextSteps }
}

export function getKpiProgress(kpi: InitiativeKpi) {
  if (kpi.latestObserved === null || kpi.target === null) return null
  if (kpi.baseline === null || kpi.target === kpi.baseline) return kpi.latestObserved === kpi.target ? 100 : null
  const progress = kpi.direction === "higher-is-better"
    ? (kpi.latestObserved - kpi.baseline) / (kpi.target - kpi.baseline)
    : (kpi.baseline - kpi.latestObserved) / (kpi.baseline - kpi.target)
  return Math.max(0, Math.min(100, Math.round(progress * 100)))
}

const exampleAnswers: Record<string, string> = {
  "people-users": "Restaurant managers would review forecasts when planning staffing and food preparation.",
  "people-training": "Possibly — we need to learn more",
  "people-review": "A manager with responsibility for the daily operating plan would make the final call.",
  "process-work": "Anticipate customer demand so managers can plan staffing, food preparation, and inventory.",
  "process-current": "Managers use recent traffic, reservations, day-of-week patterns, and local experience to plan.",
  "process-override": "Yes, a person will make the final decision",
  "product-purpose": "Estimate upcoming demand and give managers a forecast they can review alongside local context.",
  "product-systems": "Potentially aggregated order, reservation, calendar, and inventory information; availability and permission are unconfirmed.",
  "delivery-owner": "A restaurant operations initiative lead would coordinate planning; no individual is assigned in this illustration.",
  "delivery-milestones": "Document today's process, confirm information needs, agree measures, then decide whether a small pilot is appropriate.",
  "performance-outcome": "Reduce avoidable waits and unnecessary preparation while maintaining service quality.",
  "performance-measure": "Consider wait time and food waste alongside staffing coverage and customer satisfaction.",
  "performance-baseline": "No, we need to establish one",
  "security-sensitive": "Unsure — information sources are not defined",
  "security-harms": "An inaccurate forecast could contribute to poor coverage or excess preparation if people rely on it without review.",
}

export function createCheesecakeExampleDraft(): InitiativeDraft {
  const now = new Date().toISOString()
  return {
    id: CHEESECAKE_DEMO_ID,
    name: "AI-Powered Restaurant Demand Forecasting",
    description: "Fictional educational walkthrough of a restaurant team exploring demand forecasting.",
    goal: "Improve business efficiency",
    objective: "Explore whether AI could help restaurant operations anticipate customer demand, improve staffing and food preparation decisions, reduce unnecessary waste, and manage customer wait times.",
    department: "Restaurant operations (fictional role context)",
    challenge: "Managers may find it difficult to anticipate changing demand when balancing staffing, food preparation, inventory, and customer wait times.",
    currentProcess: "A manager may consider recent traffic, reservations, day-of-week patterns, and local experience when planning. This is an illustrative process, not a claim about a real restaurant.",
    peopleImpacted: "General manager, kitchen manager, operations analyst, technical support contact, restaurant employees, and customers (fictional roles).",
    intendedUse: "Offer an estimated demand range for a manager to review alongside local context. The system would not automatically set staffing or food orders.",
    expectedBenefit: "Potentially reduce avoidable waits and unnecessary food preparation while maintaining service quality; no benefits have been measured.",
    successLooksLike: "A future evaluation would compare service, staffing, waste, and customer experience using agreed measures and a suitable baseline.",
    peopleSkills: "Operational judgment, data interpretation, process knowledge, and appropriate review skills may be useful.",
    resourceNeeds: "Fictional planning roles include operations ownership, kitchen input, analysis support, and technical consultation. Availability is not established.",
    successMetric: "Customer wait time, food waste, staffing coverage, forecast accuracy, and customer satisfaction are potential measures.",
    baseline: "",
    target: "",
    unit: "",
    measurementPeriod: "Weekly or by comparable service period, to be agreed",
    assessmentAreas: assessmentAreas.map((area) => area.id),
    checklist: {},
    decisionNote: "Compare a limited, human-reviewed evaluation with the current process after information needs, safeguards, and measures are clarified.",
    nextStep: "Confirm how a representative baseline could be established and who should review it.",
    readinessAnswers: { ...exampleAnswers },
    readinessNotes: {
      "people-users": "Fictional role example; no real employee is identified.",
      "product-systems": "No data access or availability is confirmed.",
      "security-sensitive": "Resolve before selecting information or designing a test.",
    },
    kpis: [
      { id: "example-wait", name: "Average customer wait time", description: "A potential service measure for comparable service periods.", unit: "minutes", baseline: 28, target: 22, latestObserved: null, measurementPeriod: "Weekly, by comparable service period", owner: "Operations analyst (fictional role)", direction: "lower-is-better", status: "not-started", source: "illustrative" },
      { id: "example-waste", name: "Food waste per week", description: "Potentially track discarded food using an agreed definition.", unit: "kg / week", baseline: 18.5, target: 15, latestObserved: null, measurementPeriod: "Weekly", owner: "Kitchen manager (fictional role)", direction: "lower-is-better", status: "not-started", source: "illustrative" },
      { id: "example-forecast", name: "Forecast accuracy", description: "A possible forecast-quality measure; the metric and method need agreement.", unit: "%", baseline: null, target: 85, latestObserved: null, measurementPeriod: "By comparable forecast period", owner: "Operations analyst (fictional role)", direction: "higher-is-better", status: "not-started", source: "illustrative" },
    ],
    stakeholders: [
      { id: "example-owner", name: "", role: "General manager", kind: "initiative-owner", responsibilities: "Coordinate business questions and retain responsibility for local operating decisions.", skills: ["Operational planning", "Human review"] },
      { id: "example-sponsor", name: "", role: "Operations sponsor", kind: "business-sponsor", responsibilities: "Help confirm the business objective, priorities, and review path.", skills: ["Business value", "Change planning"] },
      { id: "example-kitchen", name: "", role: "Kitchen manager", kind: "reviewer", responsibilities: "Provide process context about preparation, inventory, and service constraints.", skills: ["Kitchen operations", "Inventory context"] },
      { id: "example-analyst", name: "", role: "Operations analyst", kind: "other", responsibilities: "Help define comparable measures and examine aggregated information if approved.", skills: ["Measurement", "Data interpretation"] },
      { id: "example-tech", name: "", role: "Technical support contact", kind: "technical-contact", responsibilities: "Identify technical dependencies and consult the appropriate security or data owners.", skills: ["Systems context", "Data stewardship"] },
    ],
    skills: [
      { id: "example-skill-ops", name: "Operational planning", trainingConsideration: "Explain where forecasts fit and where human judgment remains necessary.", status: "identified" },
      { id: "example-skill-data", name: "Interpreting forecasts and uncertainty", trainingConsideration: "Consider practical guidance on ranges, limitations, and escalation.", status: "training-needed" },
      { id: "example-skill-measure", name: "Outcome measurement", trainingConsideration: "Agree definitions and comparable periods before evaluating results.", status: "identified" },
    ],
    actions: [
      { id: "example-action-process", title: "Document how demand planning works today", description: "Capture the main planning steps and where local judgment matters.", priority: "high", owner: "General manager (fictional role)", dueDate: "2026-11-28", status: "todo", readinessArea: "processes" },
      { id: "example-action-data", title: "Confirm information sources and permissions", description: "Ask appropriate data owners whether aggregated information is available and suitable.", priority: "high", owner: "Technical support contact (fictional role)", dueDate: "2026-12-04", status: "waiting", readinessArea: "security" },
      { id: "example-action-kpi", title: "Agree measurement definitions", description: "Confirm how wait time, waste, and service quality would be measured.", priority: "medium", owner: "Operations analyst (fictional role)", dueDate: "2026-12-09", status: "in-progress", readinessArea: "performance" },
      { id: "example-action-training", title: "Outline manager review and training needs", description: "Describe how a manager could challenge or override an estimate.", priority: "medium", owner: "Operations sponsor (fictional role)", dueDate: "2026-12-12", status: "todo", readinessArea: "people" },
    ],
    evidence: [
      { id: "example-evidence-requirements", title: "Business requirements and intended use", description: "Plain-language scope, intended users, and what the forecast should support.", category: "business", requestedOwner: "Operations sponsor (fictional role)", status: "requested", notes: "Example checklist item only; no document is attached.", reference: "" },
      { id: "example-evidence-process", title: "Current demand-planning process", description: "A process outline showing decisions, handoffs, and existing workarounds.", category: "process", requestedOwner: "General manager (fictional role)", status: "requested", notes: "Illustrative request; not supplied or verified.", reference: "" },
      { id: "example-evidence-data", title: "Information availability and quality notes", description: "High-level information sources, owners, permissions, gaps, and quality considerations.", category: "data", requestedOwner: "Technical support contact (fictional role)", status: "not-requested", notes: "Do not add actual or confidential data to this demonstration.", reference: "" },
      { id: "example-evidence-risk", title: "Privacy, security, and operational risk review", description: "Potential risks, safeguards, accountable reviewers, and escalation paths.", category: "risk", requestedOwner: "Appropriate review roles", status: "not-requested", notes: "No review has been performed.", reference: "" },
      { id: "example-evidence-test", title: "Testing approach and acceptance criteria", description: "How forecast quality, human review, and service impacts could be evaluated.", category: "testing", requestedOwner: "Operations analyst (fictional role)", status: "not-requested", notes: "No testing has taken place.", reference: "" },
      { id: "example-evidence-outcome", title: "Outcome baseline and measurement plan", description: "Definitions, sources, owners, comparison period, and review cadence for proposed KPIs.", category: "outcomes", requestedOwner: "Operations analyst (fictional role)", status: "not-requested", notes: "Illustrative checklist item; no outcome has been measured.", reference: "" },
    ],
    milestones: [
      { id: "example-milestone-process", title: "Review the current process", description: "Confirm how demand planning works and who makes decisions.", dueDate: "2026-12-02", status: "planned", owner: "General manager (fictional role)" },
      { id: "example-milestone-data", title: "Clarify data and risk questions", description: "Identify potential sources, permissions, and reviewers before selecting data.", dueDate: "2026-12-10", status: "planned", owner: "Technical support contact (fictional role)" },
      { id: "example-milestone-review", title: "Hold a planning review", description: "Review requirements, measures, safeguards, and open questions before deciding whether to scope a pilot.", dueDate: "2026-12-18", status: "planned", owner: "Operations sponsor (fictional role)" },
    ],
    activity: [{ id: "example-created", summary: "Fictional example sandbox opened", occurredAt: now }],
    source: "illustrative",
    updatedAt: now,
  }
}
