import React from "react"
import { ThemeProvider } from "./ThemeProvider"
import { QueryClientProvider } from "./QueryClientProvider"
import { Toaster } from "sonner"

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider>
      <ThemeProvider defaultTheme="system" storageKey="teamhub-ui-theme">
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
