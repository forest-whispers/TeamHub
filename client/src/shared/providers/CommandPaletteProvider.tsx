import React, { createContext, useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { GlobalCommandPalette } from "@/features/global-search/components/GlobalCommandPalette"

interface CommandPaletteContextType {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType | undefined>(undefined)

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider")
  }
  return context
}

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const isDashboard = location.pathname.startsWith("/dashboard")

  useEffect(() => {
    if (isDashboard) {
      setIsOpen(false) // Close if open and navigating to dashboard
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isDashboard])

  return (
    <CommandPaletteContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
      <GlobalCommandPalette isOpen={isOpen} setIsOpen={setIsOpen} />
    </CommandPaletteContext.Provider>
  )
}