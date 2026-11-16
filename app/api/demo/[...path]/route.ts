import { NextResponse } from "next/server"

type RouteContext = { params: Promise<{ path: string[] }> }

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message, source: "proxy" }, { status, headers: { "Cache-Control": "no-store" } })
}

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params
  const resource = path.join("/")
  const isReadRequest = request.method === "GET" && (resource === "config" || resource === "health")
  const stepMatch = resource.match(/^step\/([1-5])$/)

  if (!isReadRequest && !(request.method === "POST" && stepMatch)) {
    return jsonError("Unsupported demo API route.", 404)
  }

  let body: { state: Record<string, unknown> } | undefined
  if (request.method === "POST") {
    try {
      const parsed: unknown = await request.json()
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !("state" in parsed)) {
        return jsonError("Step requests must include a state object.", 400)
      }
      const state = (parsed as { state?: unknown }).state
      if (!state || typeof state !== "object" || Array.isArray(state)) {
        return jsonError("The state value must be a JSON object.", 400)
      }
      body = { state: state as Record<string, unknown> }
    } catch {
      return jsonError("The step request body must be valid JSON.", 400)
    }
  }

  const configuredBaseUrl = process.env.DEMO_API_BASE_URL?.trim()
  if (!configuredBaseUrl) {
    return jsonError("DEMO_API_BASE_URL is not configured. Set it to a backend URL reachable by the Next.js server.", 503)
  }

  let backendUrl: URL
  try {
    backendUrl = new URL(`${configuredBaseUrl.replace(/\/+$/, "")}/api/${resource}`)
    if (backendUrl.protocol !== "http:" && backendUrl.protocol !== "https:") throw new Error("Invalid protocol")
  } catch {
    return jsonError("DEMO_API_BASE_URL must be a valid HTTP or HTTPS URL.", 500)
  }

  try {
    const upstream = await fetch(backendUrl, {
      method: request.method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    })
    const responseBody = await upstream.text()
    const headers = new Headers({
      "Cache-Control": "no-store",
      "X-Demo-Upstream-Status": String(upstream.status),
    })
    const contentType = upstream.headers.get("content-type")
    if (contentType) headers.set("Content-Type", contentType)
    return new Response(responseBody, { status: upstream.status, headers })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError"
    return jsonError(
      timedOut
        ? "The demo backend did not respond within 15 seconds. Check that it is running and reachable from this server."
        : "Could not reach the demo backend. Check DEMO_API_BASE_URL and confirm the backend is reachable from this server.",
      timedOut ? 504 : 502,
    )
  }
}

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context)
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context)
}
