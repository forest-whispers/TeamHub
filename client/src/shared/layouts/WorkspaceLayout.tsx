import { useState, Suspense } from "react"
import { Link, NavLink, Outlet, useParams, useLocation } from "react-router-dom"
import { useTheme } from "@/shared/providers/ThemeProvider"
import { useCommandPalette } from "@/shared/providers/CommandPaletteProvider"
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus"
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace"
import { useLogout } from "@/features/auth/hooks/useLogout"
import { DocumentTabsProvider } from "@/features/document-editor/context/DocumentTabsContext"
import { NotificationBell } from "@/features/workspace-notifications/components/NotificationBell"
import { Spinner } from "@/shared/components/ui/spinner"
import { AssistantPanel } from "@/features/workspace-ai/components/AssistantPanel"
import {
  Home,
  FileText,
  Activity,
  Folder,
  BarChart3,
  Settings,
  Search,
  ArrowLeft,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Users,
  Menu,
  X,
  Sparkles,
} from "lucide-react"

export default function WorkspaceLayout() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const { setIsOpen } = useCommandPalette()
  const { data: authStatus } = useAuthStatus()
  const { data: activeWorkspace } = useWorkspace(workspaceId || "")
  const logoutMutation = useLogout()

  // Layout states
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<"members" | "chat">("members")
  const [isMobileLeftOpen, setIsMobileLeftOpen] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  // Find active workspace details
  const workspaceName = activeWorkspace?.name || "Engineering Team"

  // User details
  const userName = authStatus?.user?.name || "Alex Developer"
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  // Navigation items
  const navItems = [
    { name: "Home", path: "home", icon: Home },
    { name: "Documents", path: "documents", icon: FileText },
    { name: "Members", path: "members", icon: Users },
    { name: "Chat", path: "chat", icon: MessageSquare },
    { name: "Activity", path: "activity", icon: Activity },
    { name: "Files", path: "files", icon: Folder },
    { name: "Analytics", path: "analytics", icon: BarChart3 },
    { name: "Settings", path: "settings", icon: Settings },
  ]

  // Mock collaboration data

  const mockMessages = [
    { id: 1, sender: "Alex Developer", time: "10:32 AM", text: "Welcome to the workspace chat room! Feel free to coordinate tasks here." },
    { id: 2, sender: "Jamie Product", time: "10:34 AM", text: "Nice! This workspace shell feels very responsive." },
    { id: 3, sender: "Taylor Support", time: "10:35 AM", text: "Indeed, the nested routing is working perfectly." },
  ]

  // Get active module name from route
  const getActiveModuleName = () => {
    const parts = location.pathname.split("/")
    const lastPart = parts[parts.length - 1]
    if (!lastPart || lastPart === workspaceId) return "Home"
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <DocumentTabsProvider>
      <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileLeftOpen(true)}
            className="md:hidden p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            title="Open Sidebar"
          >
            <Menu className="size-5" />
          </button>

          <Link
            to="/dashboard"
            className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="font-semibold text-sm tracking-tight truncate max-w-30 sm:max-w-xs md:max-w-md">
            {workspaceName}
          </span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 border border-input rounded-md bg-background text-muted-foreground text-xs hover:bg-accent hover:text-accent-foreground w-40 sm:w-64 justify-between transition-colors cursor-pointer shrink"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="size-3.5" />
            <span className="truncate">Search...</span>
          </span>
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications Button */}
          <NotificationBell workspaceId={workspaceId || ""} />

          {/* AI Assistant Button */}
          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className={`p-2 hover:bg-muted rounded-md transition-colors cursor-pointer ${
              isAssistantOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle AI Assistant"
          >
            <Sparkles className="size-4" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {/* User Avatar */}
          <div
            className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold border border-primary/25 cursor-default select-none shrink-0"
            title={userName}
          >
            {userInitials}
          </div>

          {/* Log Out Button */}
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-xs text-muted-foreground hover:text-destructive px-2 py-1 rounded-md border border-border hover:bg-muted font-medium cursor-pointer transition-colors"
            title="Log Out"
          >
            {logoutMutation.isPending ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </header>

      {/* Main Framework Body */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Mobile Navigation Drawer */}
        {isMobileLeftOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileLeftOpen(false)}
            />
            {/* Slide-out Drawer */}
            <aside className="relative flex w-64 max-w-xs flex-col bg-card border-r border-border p-4 shadow-lg animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold tracking-tight">{workspaceName}</span>
                <button
                  onClick={() => setIsMobileLeftOpen(false)}
                  className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={`/workspace/${workspaceId}/${item.path}`}
                    onClick={() => setIsMobileLeftOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer select-none ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </aside>
          </div>
        )}

        {/* Desktop Left Navigation Sidebar */}
        <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col overflow-hidden shrink-0 select-none">
          <div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 uppercase">
              {workspaceName.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <h3 className="font-semibold text-sm truncate text-foreground">{workspaceName}</h3>
              <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold tracking-wider">
                {activeWorkspace?.members.length || 1} Member{activeWorkspace?.members.length !== 1 && "s"}
              </p>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={`/workspace/${workspaceId}/${item.path}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer select-none ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`
                }
              >
                <item.icon className="size-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-background relative flex flex-col h-full">
          {/* Breadcrumb Header */}
          <div className="h-12 border-b border-border px-6 flex items-center justify-between bg-card shrink-0 select-none">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium hover:text-foreground transition-colors cursor-pointer">
                {workspaceName}
              </span>
              <span className="text-border text-xs">/</span>
              <span className="font-semibold text-foreground">{getActiveModuleName()}</span>
            </div>
          </div>

          {/* Module Content Viewport */}
          <div className="flex-1 overflow-y-auto h-full">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center p-12">
                <Spinner className="size-6" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </div>
        </main>

        {/* Desktop Right Collaboration Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-l border-border bg-card transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
            isCollapsed ? "w-14" : "w-80"
          }`}
        >
          {isCollapsed ? (
            /* Collapsed Sidebar Layout */
            <div className="h-full flex flex-col items-center py-4 justify-between select-none">
              <div className="flex flex-col items-center gap-4 w-full">
                {/* Expand Button */}
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
                  title="Expand Sidebar"
                >
                  <ChevronLeft className="size-4.5" />
                </button>

                <div className="border-t border-border w-8 my-1" />

                {/* Tab Switcher Icons */}
                <button
                  onClick={() => {
                    setActiveTab("members")
                    setIsCollapsed(false)
                  }}
                  className={`p-2 rounded-md transition-colors cursor-pointer relative ${
                    activeTab === "members" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title="Show Members"
                >
                  <Users className="size-4" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("chat")
                    setIsCollapsed(false)
                  }}
                  className={`p-2 rounded-md transition-colors cursor-pointer relative ${
                    activeTab === "chat" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title="Show Chat"
                >
                  <MessageSquare className="size-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Expanded Sidebar Layout */
            <div className="h-full flex flex-col overflow-hidden text-left">
              {/* Header Tab Controls */}
              <div className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-card select-none">
                <div className="flex bg-muted/65 p-0.5 rounded-lg border border-border/40 gap-0.5">
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === "members"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Users className="size-3.5" />
                    <span>Members</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      activeTab === "chat"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MessageSquare className="size-3.5" />
                    <span>Chat</span>
                  </button>
                </div>

                {/* Collapse Button */}
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <ChevronRight className="size-4.5" />
                </button>
              </div>

              {/* Sidebar Content Placeholder View */}
              {activeTab === "members" ? (
                /* Members Tab Placeholder */
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 select-none">
                    Active Members ({activeWorkspace?.members.length})
                  </div>
                  {activeWorkspace?.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 text-sm">
                      <div className="relative select-none">
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                          {member.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card ${
                            member.status === "online"
                              ? "bg-emerald-500"
                              : member.status === "away"
                              ? "bg-amber-500"
                              : "bg-muted-foreground/45"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium truncate text-foreground">{member.name}</span>
                          {member.name === userName && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-px rounded font-semibold uppercase select-none">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Chat Tab Placeholder */
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-2 select-none">
                      Workspace Chat Room
                    </div>
                    {mockMessages.map((msg) => (
                      <div key={msg.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs select-none">
                          <span className="font-semibold text-foreground">{msg.sender}</span>
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        </div>
                        <div className="bg-muted/50 p-2.5 rounded-lg text-sm text-foreground leading-snug border border-border/30">
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Disabled Chat Input Panel */}
                  <div className="p-3 border-t border-border bg-card shrink-0">
                    <input
                      type="text"
                      disabled
                      placeholder="Chat is disabled in this shell..."
                      className="flex-1 bg-muted/60 border border-input rounded-md px-3 py-1.5 text-xs text-muted-foreground cursor-not-allowed w-full outline-none select-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
      </div>

      <AssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </DocumentTabsProvider>
  )
}