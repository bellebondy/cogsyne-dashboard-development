"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, PanelTopClose, RotateCcw, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ViewId } from "@/lib/founder-demo-data"
import { FranklinAvatar } from "./franklin-avatar"
import { useInitiativeWorkspace } from "@/lib/initiative-workspace"

type ChatMessage = { role: "user" | "assistant"; content: string }

const SESSION_KEY = "comradii.franklin.conversation.v1"
const MAX_LOCAL_MESSAGES = 14

const pageIntros: Record<string, string> = {
  overview: "Need help getting started?",
  readiness: "I can help you think through a planning question.",
  performance: "Want help choosing a useful business measure?",
  people: "I can help identify roles, skills, and training needs.",
  evidence: "Want help understanding what evidence can show?",

  showcase: "Curious how the factory responsibilities fit together?",
  demo: "Want to understand what this demonstration can and can’t tell you?",
  decision: "Need help thinking through your next steps?",
  example: "Want to explore the restaurant example?",
  F1: "Want to talk through people assurance?",
  F2: "I can help explain process assurance.",
  F3: "Want to understand product assurance?",
  F4: "Want help turning an idea into an AI initiative?",
  F5: "I can help explain program assurance.",
  F6: "Want to understand how to measure AI success?",
  F7: "I can help explain technical assurance.",
  F8: "Want to explore how assurance insights can be combined?",
  F9: "I can help explain assurance intelligence.",
  F10: "Want to talk through cyber assurance?",
  F11: "Need help understanding talent assurance?",
  F12: "I can help think through venture and operator readiness.",
}

const starterPrompts = [
  "What does Cogsyne AI do?",
  "Help me plan an AI initiative.",
  "What should I evaluate before using AI?",
]

const pageSuggestions: Partial<Record<ViewId, string[]>> = {
  readiness: ["Help me answer this readiness question.", "Explain this planning gap."],
  performance: ["What KPI should I consider?"],
  people: ["What roles or skills should I plan for?"],
  decision: ["Help me organize the next steps."],
  evidence: ["What evidence might I need?"],
  example: ["How could AI demand forecasting help a restaurant?"],
}

function readSessionMessages(): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "[]")
    if (!Array.isArray(stored)) return []
    return stored
      .filter((message): message is ChatMessage =>
        Boolean(message)
        && typeof message === "object"
        && (message.role === "user" || message.role === "assistant")
        && typeof message.content === "string"
        && message.content.length <= 4_000,
      )
      .slice(-MAX_LOCAL_MESSAGES)
  } catch {
    return []
  }
}

function friendlyFailure(status?: number) {
  if (status === 429) return "I’ve reached a short-term message limit. Please wait a moment and try again."
  if (status === 413) return "That conversation is a bit long to send. Please clear it or start a new topic."
  return "Franklin couldn't connect to OpenAI. Please check the API configuration or try again."
}

export function FranklinChat({ pageId }: { pageId: ViewId }) {
  const { selectedDraft } = useInitiativeWorkspace()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hasLoadedSession, setHasLoadedSession] = useState(false)
  const [draft, setDraft] = useState("")
  const [streamingText, setStreamingText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [includeInitiativeContext, setIncludeInitiativeContext] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(readSessionMessages())
    setHasLoadedSession(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedSession) return
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-MAX_LOCAL_MESSAGES)))
    } catch {
      setError("This browser couldn’t save the conversation for this session.")
    }
  }, [messages, hasLoadedSession])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
  }, [messages, streamingText, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        launcherRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen])

  const sendMessage = async (text: string) => {
    const content = text.trim()
    if (!content || isSending) return

    const initiativeContext = includeInitiativeContext && selectedDraft
      ? [`Initiative: ${selectedDraft.name}`, `Business objective: ${selectedDraft.objective || selectedDraft.goal || "Not provided"}`, `Business problem: ${selectedDraft.challenge || "Not provided"}`, `Potential AI use: ${selectedDraft.intendedUse || "Not provided"}`].join("\n")
      : ""
    const messageContent = initiativeContext ? `${content}\n\nContext the user chose to include:\n${initiativeContext}` : content
    const conversation = [...messages, { role: "user" as const, content: messageContent }].slice(-MAX_LOCAL_MESSAGES)
    setMessages(conversation)
    setIncludeInitiativeContext(false)
    setDraft("")
    setError("")
    setStreamingText("")
    setIsSending(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation, pageId }),
      })
      if (!response.ok) {
        let statusMessage = friendlyFailure(response.status)
        try {
          const data: unknown = await response.json()
          if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
            statusMessage = data.error
          }
        } catch {
          statusMessage = friendlyFailure(response.status)
        }
        setError(statusMessage)
        return
      }
      if (!response.body) {
        setError(friendlyFailure())
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let bufferedLine = ""
      let answer = ""
      let streamError = ""
      const handleStreamLine = (line: string) => {
        if (!line.trim()) return
        const event: unknown = JSON.parse(line)
        if (!event || typeof event !== "object") return
        if ("type" in event && event.type === "text" && "text" in event && typeof event.text === "string") {
          answer += event.text
          setStreamingText(answer)
        }
        if ("type" in event && event.type === "error" && "message" in event && typeof event.message === "string") {
          streamError = event.message
        }
      }
      while (true) {
        const { done, value } = await reader.read()
        bufferedLine += decoder.decode(value, { stream: !done })
        const lines = bufferedLine.split("\n")
        bufferedLine = lines.pop() ?? ""
        for (const line of lines) handleStreamLine(line)
        if (done) break
      }
      if (bufferedLine.trim()) handleStreamLine(bufferedLine)
      if (streamError) {
        setError(streamError)
        setStreamingText("")
        return
      }
      if (!answer.trim()) {
        setError(friendlyFailure())
        return
      }
      setMessages((current) => [...current, { role: "assistant" as const, content: answer }].slice(-MAX_LOCAL_MESSAGES))
      setStreamingText("")
    } catch {
      setError(friendlyFailure())
      setStreamingText("")
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendMessage(draft)
  }

  const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      void sendMessage(draft)
    }
  }

  const clearConversation = () => {
    if (isSending) return
    setMessages([])
    setDraft("")
    setError("")
    setStreamingText("")
  }

  const closeChat = () => {
    setIsOpen(false)
    launcherRef.current?.focus()
  }

  return (
    <div className="franklin-widget">
      {isOpen && (
        <section id="franklin-panel" className="franklin-panel" role="dialog" aria-labelledby="franklin-title" aria-describedby="franklin-disclosure">
          <header className="franklin-header">
            <div className="franklin-identity">
              <span className="franklin-header-avatar"><FranklinAvatar /></span>
              <span className="franklin-identity-copy">
                <strong id="franklin-title">Franklin</strong>
                <span>Your AI Transformation Guide</span>
              </span>
            </div>
            <div className="franklin-header-actions">
              <button type="button" className="franklin-header-button" onClick={clearConversation} disabled={isSending || messages.length === 0} aria-label="Clear conversation" title="Clear conversation">
                <RotateCcw aria-hidden="true" />
              </button>
              <button type="button" className="franklin-header-button" onClick={closeChat} aria-label="Minimize Franklin chat" title="Minimize chat">
                <PanelTopClose aria-hidden="true" />
              </button>
              <button type="button" className="franklin-header-button franklin-mobile-close" onClick={closeChat} aria-label="Close Franklin chat" title="Close chat">
                <X aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="franklin-transcript" ref={transcriptRef} role="log" aria-label="Conversation with Franklin" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <div className="franklin-welcome">
                <div className="franklin-welcome-avatar"><FranklinAvatar /></div>
                <span className="franklin-eyebrow">YOUR AI TRANSFORMATION GUIDE</span>
                <p>Hey! I&apos;m Franklin. Whether you&apos;re exploring AI for the first time or planning your next initiative, I&apos;m here to help. What are we working on today?</p>
                <span className="franklin-page-nudge">{pageIntros[pageId] ?? pageIntros.overview}</span>
                <div className="franklin-starters" aria-label="Conversation starters">
                  {starterPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} disabled={isSending}>{prompt}</button>
                  ))}
                  {pageSuggestions[pageId]?.map((prompt) => <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} disabled={isSending}>{prompt}</button>)}
                </div>
              </div>
            ) : (
              <div className="franklin-message-list">
                {messages.map((message, index) => (
                  <div className={`franklin-message-row ${message.role === "user" ? "from-user" : "from-franklin"}`} key={`${index}-${message.role}`}>
                    {message.role === "assistant" && <span className="franklin-message-avatar"><FranklinAvatar /></span>}
                    {message.role === "assistant" ? (
                      <div className="franklin-message-bubble franklin-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="franklin-message-bubble">{message.content}</p>
                    )}
                  </div>
                ))}
                {isSending && (
                  <div className="franklin-message-row from-franklin" aria-label="Franklin is responding">
                    <span className="franklin-message-avatar"><FranklinAvatar /></span>
                    <div className="franklin-message-bubble franklin-live-bubble franklin-markdown">
                      {streamingText ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingText}</ReactMarkdown> : <span className="franklin-typing" aria-label="Franklin is thinking"><i /><i /><i /></span>}
                    </div>
                  </div>
                )}
              </div>
            )}
            {error && <p className="franklin-error" role="alert">{error}</p>}
          </div>

          <form className="franklin-composer" onSubmit={submitMessage}>
            {selectedDraft && <label className="franklin-context-choice"><input type="checkbox" checked={includeInitiativeContext} onChange={(event) => setIncludeInitiativeContext(event.target.checked)} /><span>Include a short summary of <strong>{selectedDraft.name}</strong> in my next message</span></label>}
            <label className="sr-only" htmlFor="franklin-input">Message Franklin</label>
            <div className="franklin-composer-row">
              <textarea
                id="franklin-input"
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 3_500))}
                onKeyDown={onComposerKeyDown}
                placeholder="Ask Franklin a question..."
                maxLength={3_500}
                disabled={isSending}
              />
              <button type="submit" className="franklin-send-button" aria-label="Send message" disabled={isSending || !draft.trim()}>
                <ArrowUp aria-hidden="true" />
              </button>
            </div>
            <p id="franklin-disclosure" className="franklin-disclosure">Messages are processed by OpenAI. Initiative details are shared only if you select the checkbox. AI usage may incur charges.</p>
          </form>
        </section>
      )}

      <div className="franklin-launcher-wrap">
        <span className="franklin-launcher-tooltip" aria-hidden="true">Chat with Franklin.</span>
        <button
          ref={launcherRef}
          type="button"
          className="franklin-launcher"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Minimize Franklin chat" : "Chat with Franklin"}
          aria-expanded={isOpen}
          aria-controls={isOpen ? "franklin-panel" : undefined}
          title="Chat with Franklin."
        >
          <FranklinAvatar />
          <span className="franklin-launcher-spark" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
