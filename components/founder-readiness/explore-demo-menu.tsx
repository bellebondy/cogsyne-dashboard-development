"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react"

export function ExploreDemoMenu({ onExplore }: { onExplore: () => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    optionRef.current?.focus()
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener("pointerdown", closeOutside)
    document.addEventListener("keydown", closeOnEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      document.removeEventListener("keydown", closeOnEscape)
    }
  }, [open])

  return (
    <div className="demo-explorer-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        className="demo-explorer-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        <Sparkles size={15} aria-hidden="true" />
        <span>Explore Demo</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div className="demo-explorer-panel" role="menu" aria-label="Explore demos">
          <button
            ref={optionRef}
            className="demo-explorer-option"
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onExplore()
            }}
            onKeyDown={(event) => {
              if (event.key === "Tab") setOpen(false)
            }}
          >
            <span>
              <strong>The Cheesecake Factory walkthrough</strong>
              <small>Fictional educational example</small>
            </span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
