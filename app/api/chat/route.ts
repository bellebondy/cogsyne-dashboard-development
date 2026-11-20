
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { getFranklinSystemPrompt } from "@/lib/franklin-config"

export const runtime = "nodejs"
export const maxDuration = 30

const MAX_BODY_BYTES = 20_000
const MAX_MESSAGES = 14
const MAX_MESSAGE_LENGTH = 3_500
const MAX_TOTAL_LENGTH = 14_000
const RATE_WINDOW_MS = 60_000
const RATE_LIMIT = 8

const rateLimits = new Map<
  string,
  { startedAt: number; count: number }
>()

function errorResponse(
  message: string,
  status: number,
  headers?: HeadersInit
) {
  return Response.json(
    { error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...Object.fromEntries(new Headers(headers).entries()),
      },
    }
  )
}

function clientKey(request: Request) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(-1)
    ?.trim()

  return (
    forwarded ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown-client"
  )
}

async function readBoundedJson(
  request: Request
): Promise<{ value?: unknown; tooLarge: boolean }> {
  const reader = request.body?.getReader()

  if (!reader) {
    return { tooLarge: false }
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()

    if (done) break

    totalBytes += value.byteLength

    if (totalBytes > MAX_BODY_BYTES) {
      await reader.cancel()
      return { tooLarge: true }
    }

    chunks.push(value)
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0

  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  return {
    value: JSON.parse(new TextDecoder().decode(bytes)),
    tooLarge: false,
  }
}

function isValidMessage(
  value: unknown
): value is {
  role: "user" | "assistant"
  content: string
} {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false
  }

  const message = value as Record<string, unknown>

  return (
    (message.role === "user" ||
      message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= MAX_MESSAGE_LENGTH
  )
}

export async function POST(request: Request) {
  // Keep Franklin disabled unless explicitly enabled.
  if (process.env.FRANKLIN_CHAT_ENABLED !== "true") {
    return errorResponse(
      "Franklin chat is currently disabled on this site.",
      503
    )
  }

  // Check that the OpenAI key is configured.
  if (!process.env.OPENAI_API_KEY) {
    return errorResponse(
      "Franklin is missing its OpenAI API configuration.",
      503
    )
  }

  const contentLength = Number(
    request.headers.get("content-length") ?? 0
  )

  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(
      "That message is too large. Please shorten it and try again.",
      413
    )
  }

  // Basic rate limiting for local testing.
  const key = clientKey(request)
  const now = Date.now()
  const current = rateLimits.get(key)

  if (
    current &&
    now - current.startedAt < RATE_WINDOW_MS &&
    current.count >= RATE_LIMIT
  ) {
    const retryAfter = Math.max(
      1,
      Math.ceil(
        (RATE_WINDOW_MS -
          (now - current.startedAt)) /
          1000
      )
    )

    return errorResponse(
      "Franklin has reached the short-term message limit. Please wait a moment and try again.",
      429,
      { "Retry-After": String(retryAfter) }
    )
  }

  if (
    !current ||
    now - current.startedAt >= RATE_WINDOW_MS
  ) {
    rateLimits.set(key, {
      startedAt: now,
      count: 1,
    })
  } else {
    rateLimits.set(key, {
      ...current,
      count: current.count + 1,
    })
  }

  // Remove expired rate-limit entries.
  if (rateLimits.size > 2_000) {
    for (const [entryKey, entry] of rateLimits) {
      if (now - entry.startedAt >= RATE_WINDOW_MS) {
        rateLimits.delete(entryKey)
      }
    }
  }

  // Read the request.
  let payload: unknown

  try {
    const body = await readBoundedJson(request)

    if (body.tooLarge) {
      return errorResponse(
        "That message is too large. Please shorten it and try again.",
        413
      )
    }

    payload = body.value
  } catch {
    return errorResponse(
      "The chat request could not be read. Please try again.",
      400
    )
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    return errorResponse(
      "The chat request is incomplete. Please try again.",
      400
    )
  }

  const body = payload as Record<string, unknown>
  const messages = body.messages

  // Validate conversation messages.
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isValidMessage)
  ) {
    return errorResponse(
      "Please send a shorter conversation with a valid message.",
      400
    )
  }

  if (messages[messages.length - 1].role !== "user") {
    return errorResponse(
      "Send a message to continue the conversation.",
      400
    )
  }

  const totalLength = messages.reduce(
    (total, message) => total + message.content.length,
    0
  )

  if (totalLength > MAX_TOTAL_LENGTH) {
    return errorResponse(
      "This conversation is too long to send. Clear it or start a new topic.",
      413
    )
  }

  const pageId =
    typeof body.pageId === "string" &&
    body.pageId.length <= 40
      ? body.pageId
      : "overview"

  try {
    let providerError = ""

    // Connect Franklin directly to OpenAI.
    const result = streamText({
      model: openai("gpt-4o-mini"),

      system: getFranklinSystemPrompt(pageId),

      messages: messages.map(({ role, content }) => ({
        role,
        content,
      })),

      maxOutputTokens: 450,

      onError({ error }) {
        const message =
          error instanceof Error ? error.message : ""

        if (/quota|billing|payment|credit/i.test(message)) {
          providerError =
            "Franklin could not generate a reply because the OpenAI project may need billing or additional credits."
        } else if (
          /api.key|unauthorized|authentication|401/i.test(message)
        ) {
          providerError =
            "Franklin could not authenticate with OpenAI. Please check the API key."
        } else if (/rate.limit|429/i.test(message)) {
          providerError =
            "Franklin has reached an OpenAI usage limit. Please try again later."
        } else {
          providerError =
            "Franklin couldn't reach OpenAI. Please check the server configuration and try again."
        }

        // Do not print the API key or raw provider errors.
        console.error("[Franklin] OpenAI request failed.")
      },
    })

    // Stream Franklin's response back to the chat UI.
    const encoder = new TextEncoder()
    const reader = result.textStream.getReader()

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const { done, value } = await reader.read()

          if (done) {
            if (providerError) {
              controller.enqueue(
                encoder.encode(
                  `${JSON.stringify({
                    type: "error",
                    message: providerError,
                  })}\n`
                )
              )
            }

            controller.close()
            return
          }

          if (value) {
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  type: "text",
                  text: value,
                })}\n`
              )
            )
          }
        } catch {
          controller.enqueue(
            encoder.encode(
              `${JSON.stringify({
                type: "error",
                message:
                  providerError ||
                  "Franklin couldn't complete that response. Please try again later.",
              })}\n`
            )
          )

          controller.close()
        }
      },

      cancel(reason) {
        void reader.cancel(reason)
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type":
          "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    console.error(
      "[Franklin] OpenAI error:",
      error instanceof Error
        ? { name: error.name, message: error.message }
        : "Unknown error"
    )

    return errorResponse(
      "Franklin's AI service is unavailable right now. Please try again later.",
      503
    )
  }
}
