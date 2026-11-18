"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Moon, Sun } from "lucide-react"

type ThemePreference = "light" | "dark"
const THEME_KEY = "comradii.theme"
const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
]

function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.theme = preference
  document.documentElement.style.colorScheme = preference
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>("light")
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    let stored: ThemePreference = "light"
    try {
      const value = window.localStorage.getItem(THEME_KEY)
      if (value === "light" || value === "dark") stored = value
    } catch {
      // The light default remains available when browser storage is restricted.
    }
    setPreference(stored)
    setFocusedIndex(options.findIndex((option) => option.value === stored))
    applyTheme(stored)
  }, [])

  useEffect(() => {
    if (!open) return
    optionRefs.current[focusedIndex]?.focus()
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
  }, [focusedIndex, open])

  const changePreference = (value: ThemePreference) => {
    setPreference(value)
    setFocusedIndex(options.findIndex((option) => option.value === value))
    applyTheme(value)
    try {
      window.localStorage.setItem(THEME_KEY, value)
    } catch {
      // Applying the theme still works for this visit if storage is restricted.
    }
    setOpen(false)
    triggerRef.current?.focus()
  }

  const openAt = (index: number) => {
    setFocusedIndex(index)
    setOpen(true)
  }

  const moveFocus = (direction: 1 | -1) => {
    const next = (focusedIndex + direction + options.length) % options.length
    setFocusedIndex(next)
    optionRefs.current[next]?.focus()
  }

  const selected = options.find((option) => option.value === preference) ?? options[0]
  const TriggerIcon = selected.icon

  return (
    <div className="theme-menu" ref={rootRef}>
      <button ref={triggerRef} className="theme-control" type="button" aria-label={`Appearance: ${selected.label}`} aria-haspopup="menu" aria-expanded={open} onClick={() => open ? setOpen(false) : openAt(options.findIndex((option) => option.value === preference))} onKeyDown={(event) => {
        if (event.key === "ArrowDown") { event.preventDefault(); openAt(options.findIndex((option) => option.value === preference)) }
        if (event.key === "ArrowUp") { event.preventDefault(); openAt((options.findIndex((option) => option.value === preference) + 1) % options.length) }
      }}>
        <TriggerIcon size={16} aria-hidden="true" />
        <span>Appearance</span>
        <span className="theme-control-value">{selected.label}</span>
      </button>
      {open && <div className="theme-menu-panel" role="menu" aria-label="Choose appearance">
        {options.map(({ value, label, icon: Icon }, index) => <button key={value} ref={(element) => { optionRefs.current[index] = element }} type="button" className="theme-menu-option" role="menuitemradio" aria-checked={preference === value} tabIndex={focusedIndex === index ? 0 : -1} onClick={() => changePreference(value)} onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); moveFocus(1) }
          if (event.key === "ArrowUp") { event.preventDefault(); moveFocus(-1) }
          if (event.key === "Home") { event.preventDefault(); setFocusedIndex(0); optionRefs.current[0]?.focus() }
          if (event.key === "End") { event.preventDefault(); setFocusedIndex(options.length - 1); optionRefs.current[options.length - 1]?.focus() }
          if (event.key === "Tab") setOpen(false)
        }}>
          <Icon size={16} aria-hidden="true" />
          <span>{label}</span>
          {preference === value && <Check size={15} className="theme-menu-check" aria-hidden="true" />}
        </button>)}
      </div>}
    </div>
  )
}
