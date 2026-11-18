import { scenarioSteps, type FactoryId } from "./founder-demo-data"

export type JsonObject = Record<string, unknown>

export type ApiRequestResult = {
  method: "GET" | "POST"
  path: string
  httpStatus: number | null
  upstreamResponded: boolean
  ok: boolean
  durationMs: number
  requestedAt: string
  payload: unknown
  error?: string
}

export type StepExecutionResult = {
  request: ApiRequestResult
  payload: JsonObject | null
  successful: boolean
  backendStatus: string
}

export type DemoActivityItem = {
  id: string
  label: string
  request: ApiRequestResult
}

export function getDemoActivity(
  configRequest: ApiRequestResult | null,
  healthRequest: ApiRequestResult | null,
  stepResults: Partial<Record<number, StepExecutionResult>>,
): DemoActivityItem[] {
  const activity: DemoActivityItem[] = []
  if (configRequest) activity.push({ id: "config", label: "Backend configuration check", request: configRequest })
  if (healthRequest) activity.push({ id: "health", label: "Assessment service health check", request: healthRequest })

  for (const [index, result] of Object.entries(stepResults)) {
    const step = scenarioSteps[Number(index)]
    if (result && step) {
      activity.push({
        id: `step-${index}`,
        label: `Workflow · ${step.title.replace(/^F\d+ /, "")}`,
        request: result.request,
      })
    }
  }

  return activity.sort((first, second) => Date.parse(second.request.requestedAt) - Date.parse(first.request.requestedAt))
}

export const factoryPorts: Record<FactoryId, number> = {
  F4: 3004,
  F6: 3006,
  F1: 3001,
  F11: 3011,
}

export function isJsonObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function nestedPayload(payload: unknown): JsonObject {
  if (!isJsonObject(payload)) return {}
  if (isJsonObject(payload.data)) return payload.data
  if (isJsonObject(payload.result)) return payload.result
  return payload
}

export function getBackendStatus(payload: unknown) {
  const root = isJsonObject(payload) ? payload : {}
  const nested = nestedPayload(payload)
  const status = root.status ?? root.stepStatus ?? root.step_status ?? nested.status ?? nested.stepStatus ?? nested.step_status
  return typeof status === "string" ? status : root.source === "proxy" ? "Proxy error" : "Response received"
}

export function isSuccessfulStepResponse(payload: unknown, httpOk: boolean) {
  if (!httpOk || !isJsonObject(payload)) return false
  const root = payload
  const nested = nestedPayload(payload)
  if (root.success === false || root.ok === false || nested.success === false || nested.ok === false) return false
  const status = getBackendStatus(payload).toLowerCase()
  return !/(fail|error|blocked|denied|rejected)/.test(status)
}

export function getUpdatedWorkflowState(payload: unknown, currentState: JsonObject): JsonObject {
  if (!isJsonObject(payload)) return currentState
  const nested = nestedPayload(payload)
  const updated = payload.updatedState ?? payload.updated_state ?? payload.state ?? nested.updatedState ?? nested.updated_state ?? nested.state
  return isJsonObject(updated) ? { ...currentState, ...updated } : currentState
}

export function getResponseValue(payload: unknown, keys: string[]) {
  if (!isJsonObject(payload)) return undefined
  const nested = nestedPayload(payload)
  for (const key of keys) {
    if (payload[key] !== undefined) return payload[key]
    if (nested[key] !== undefined) return nested[key]
  }
  return undefined
}

export function getExecuteTraceHttpStatus(trace: unknown): number | undefined {
  const candidates: { status: number; depth: number }[] = []
  const descriptorKeys = new Set(["action", "endpoint", "operation", "path", "request", "requestpath", "route", "url"])
  const statusKeys = ["httpstatus", "httpstatuscode", "responsestatus", "statuscode", "status"]

  const hasExecuteDescriptor = (value: unknown, depth = 0): boolean => {
    if (depth > 6 || !value || typeof value !== "object" || Array.isArray(value)) return false
    for (const [key, entry] of Object.entries(value)) {
      const normalizedKey = normalize(key)
      if ((descriptorKeys.has(normalizedKey) || normalizedKey.includes("execute")) && typeof entry === "string" && /execute/i.test(entry)) return true
      if (!Array.isArray(entry) && hasExecuteDescriptor(entry, depth + 1)) return true
    }
    return false
  }

  const readStatus = (value: JsonObject) => {
    for (const key of statusKeys) {
      const raw = Object.entries(value).find(([entryKey]) => normalize(entryKey) === key)?.[1]
      const match = typeof raw === "number" ? raw : typeof raw === "string" ? raw.match(/(?:HTTP\s*)?(\d{3})/i)?.[1] : undefined
      const status = typeof match === "number" ? match : typeof match === "string" ? Number(match) : undefined
      if (status && status >= 100 && status <= 599) return status
    }
    return undefined
  }

  const visit = (value: unknown, inheritedExecuteContext = false, depth = 0) => {
    if (depth > 6 || !value || typeof value !== "object") return
    if (Array.isArray(value)) {
      for (const entry of value) visit(entry, inheritedExecuteContext, depth + 1)
      return
    }

    const object = value as JsonObject
    const executeContext = inheritedExecuteContext || hasExecuteDescriptor(object, depth)
    const status = readStatus(object)
    if (executeContext && status !== undefined) candidates.push({ status, depth })

    for (const [key, entry] of Object.entries(object)) {
      if (entry && typeof entry === "object") {
        const childContext = Array.isArray(entry) ? inheritedExecuteContext : executeContext || normalize(key).includes("execute")
        visit(entry, childContext, depth + 1)
      }
    }
  }

  visit(trace)
  return candidates.sort((first, second) => second.depth - first.depth)[0]?.status
}

export function getApiError(payload: unknown) {
  const value = getResponseValue(payload, ["error", "message", "detail"])
  return typeof value === "string" ? value : undefined
}

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "")
}

function matchesFactory(entry: unknown, id: FactoryId, key?: string) {
  const aliases: Record<FactoryId, string[]> = {
    F4: ["f4", "f4project", "project", "projectfactory"],
    F6: ["f6", "f6performance", "performance", "performancefactory"],
    F1: ["f1", "f1peopleassurance", "peopleassurance", "peopleassurancefactory"],
    F11: ["f11", "f11talent", "talent", "talentassurance", "talentassurancemarketplace"],
  }
  if (key && aliases[id].includes(normalize(key))) return true
  if (!isJsonObject(entry)) return false
  const idFields = [entry.id, entry.factory, entry.factoryId, entry.factory_id, entry.code, entry.name, entry.port]
  return idFields.some((field) => aliases[id].includes(normalize(field))) || idFields.includes(factoryPorts[id])
}

function findFactoryHealth(value: unknown, id: FactoryId, depth = 0): unknown {
  if (depth > 5 || !value || typeof value !== "object") return undefined
  if (Array.isArray(value)) {
    const match = value.find((entry) => matchesFactory(entry, id))
    if (match !== undefined) return match
    for (const entry of value) {
      const nested = findFactoryHealth(entry, id, depth + 1)
      if (nested !== undefined) return nested
    }
    return undefined
  }

  const object = value as JsonObject
  for (const [key, entry] of Object.entries(object)) {
    if (matchesFactory(entry, id, key)) return entry
  }
  for (const entry of Object.values(object)) {
    const nested = findFactoryHealth(entry, id, depth + 1)
    if (nested !== undefined) return nested
  }
  return undefined
}

export function getFactoryHealth(payload: unknown, id: FactoryId): "online" | "offline" | "unknown" {
  const entry = findFactoryHealth(payload, id)
  if (entry === undefined) return "unknown"
  if (typeof entry === "boolean") return entry ? "online" : "offline"
  if (typeof entry === "string") return normalizeHealth(entry)
  if (!isJsonObject(entry)) return "unknown"

  for (const key of ["up", "online", "healthy", "running", "reachable", "ok", "isOnline", "is_healthy"]) {
    if (typeof entry[key] === "boolean") return entry[key] ? "online" : "offline"
  }
  for (const key of ["status", "state", "health"]) {
    if (typeof entry[key] === "string") {
      const status = normalizeHealth(entry[key])
      if (status !== "unknown") return status
    }
  }
  return "unknown"
}

function normalizeHealth(status: string): "online" | "offline" | "unknown" {
  const normalized = normalize(status)
  if (["online", "healthy", "running", "reachable", "up", "ok", "ready"].includes(normalized)) return "online"
  if (["offline", "unhealthy", "down", "unavailable", "failed", "error", "stopped"].includes(normalized)) return "offline"
  return "unknown"
}
