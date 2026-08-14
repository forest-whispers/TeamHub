import { useEffect, useState } from "react"
import { Navigate, Outlet, useParams, Link } from "react-router-dom"
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus"
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { useTheme } from "@/shared/providers/ThemeProvider"
import { useCommandPalette } from "@/shared/providers/CommandPaletteProvider"
import { NotificationBell } from "@/features/workspace-notifications/components/NotificationBell"
import { AssistantPanel } from "@/features/workspace-ai/components/AssistantPanel"
import { Spinner } from "@/shared/components/ui/spinner"
import { socket } from "@/shared/lib/socket"
import { ArrowLeft, Search, Sparkles, Sun, Moon, Menu } from "lucide-react"

export default function AuthenticatedLayout() {
  const { data: authStatus, isLoading } = useAuthStatus()
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const { theme, setTheme } = useTheme()
  const { setIsOpen } = useCommandPalette()
  const { data: activeWorkspace } = useWorkspace(workspaceId || "")
  const logoutMutation = useLogout()

  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  useEffect(() => {
    if (authStatus?.isAuthenticated && !socket.connected) {
      socket.connect()
    }
  }, [authStatus?.isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!authStatus?.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const workspaceName = activeWorkspace?.name || "@my-workspace"
  const userName = authStatus?.user?.name || "@developer"

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-3 sm:px-4 bg-card shrink-0 select-none z-10">
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Menu Button (Only for Workspace) */}
          {workspaceId && (
            <button
              onClick={() => setIsMobileLeftOpen(true)}
              className="md:hidden p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              title="Open Sidebar"
            >
              <Menu className="size-5" />
            </button>
          )}

          {workspaceId && (
            <Link
              to="/dashboard"
              className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="size-4" />
            </Link>
          )}
          {workspaceId && (
            <span className="font-semibold text-sm tracking-tight truncate max-w-30 sm:max-w-xs md:max-w-md hidden sm:inline-block">
              {workspaceName}
            </span>
          )}
        </div>

        {/* Command Palette Trigger */}
        {workspaceId ? (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center border border-input rounded-md bg-background text-muted-foreground text-xs hover:bg-accent hover:text-accent-foreground size-8 sm:w-64 sm:h-8.5 justify-center sm:justify-between transition-all duration-200 cursor-pointer shrink px-0 sm:px-3"
            title="Search Workspace (Ctrl+K)"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="size-3.5" />
              <span className="truncate hidden sm:inline">Search...</span>
            </span>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
              <span className="text-xs">Ctrl</span>K
            </kbd>
          </button>
        ) : (
          <div className="shrink" />
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications Button */}
          <NotificationBell workspaceId={workspaceId || ""} />

          {/* AI Assistant Button (Only for Workspace) */}
          {workspaceId && (
            <button
              onClick={() => setIsAssistantOpen(!isAssistantOpen)}
              className={`p-2 hover:bg-muted rounded-md transition-colors cursor-pointer ${
                isAssistantOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle AI Assistant"
            >
              <Sparkles className="size-4" />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* User Avatar */}
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/25 hover:scale-105 cursor-default select-none shrink-0">
            {getInitials(userName)}
          </div>

          {/* Log Out Button - Hidden on mobile, accessible inside drawer */}
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded-md border border-border hover:bg-muted font-medium cursor-pointer transition-colors hidden sm:block"
            title="Log Out"
          >
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </header>

      {/* Main Body: Dynamic overflow structure for Dashboard vs Workspace Page */}
      <div className={`flex-1 flex w-full relative ${workspaceId ? "overflow-hidden" : "overflow-y-auto"}`}>
        <Outlet context={{ isMobileLeftOpen, setIsMobileLeftOpen, isAssistantOpen, setIsAssistantOpen }} />
      </div>

      {workspaceId && (
        <AssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      )}
    </div>
  )
}