import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStatus } from "../../auth/hooks/useAuthStatus"
import { useDashboard } from "../hooks/useDashboard"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { FileText, Plus, Users, Activity, AlertCircle, Briefcase, HardDrive } from "lucide-react"
import { formatActivity } from "@/features/workspace-activity/lib/activityFormatter"
import { formatActivityTime } from "@/features/workspace-activity/lib/activityTime"
import { CreateWorkspaceDialog } from "../../workspace/components/CreateWorkspaceDialog"
import { JoinWorkspaceDialog } from "../../workspace/components/JoinWorkspaceDialog"
import { InviteMembersDialog } from "../../workspace-home/components/InviteMembersDialog"


export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: authStatus } = useAuthStatus()

  // Queries
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useDashboard()

  const recentDoc = data?.continueWorking
  const workspaces = data?.workspaces
  const activity = data?.recentActivity
  const overview = data?.overview

  // Modal Dialog States
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteDetails, setInviteDetails] = useState<{ id: string; inviteCode: string } | null>(null)

  const userName = authStatus?.user?.name || "Member"

  // Sections Refs for Scroll Targets
  const overviewRef = useRef<HTMLDivElement>(null)
  const continueWorkingRef = useRef<HTMLDivElement>(null)
  const workspacesRef = useRef<HTMLDivElement>(null)
  const recentActivityRef = useRef<HTMLDivElement>(null)

  const [activeSection, setActiveSection] = useState<string>("overview")

  // smooth scroll action
  const scrollToSection = (id: string) => {
    const sectionMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      overview: overviewRef,
      "continue-working": continueWorkingRef,
      workspaces: workspacesRef,
      "recent-activity": recentActivityRef,
    }

    const targetRef = sectionMap[id]
    if (targetRef && targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
      setActiveSection(id)
    }
  }

  // Intersection Observer for scroll tracking
  useEffect(() => {
    const sections = [
      { id: "overview", ref: overviewRef },
      { id: "continue-working", ref: continueWorkingRef },
      { id: "workspaces", ref: workspacesRef },
      { id: "recent-activity", ref: recentActivityRef },
    ]

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, observerOptions)

    sections.forEach((section) => {
      if (section.ref.current) {
        observer.observe(section.ref.current)
      }
    })

    return () => {
      sections.forEach((section) => {
        if (section.ref.current) {
          observer.unobserve(section.ref.current)
        }
      })
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6 space-y-6 text-left">
      
      {/* Overview Section Wrapper */}
      <div id="overview" ref={overviewRef} className="scroll-mt-14 space-y-6">
        {/* Greeting Banner */}
        <section className="bg-card border border-border/40 rounded-xl p-4 relative overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-left select-none">
          <div className="absolute right-0 top-0 bg-primary/5 size-30 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl text-foreground">
            Welcome back, @{userName}
          </h1>
          <p className="text-muted-foreground text-xs mt-1 max-w-2xl">
            Here is a summary of what has happened in your workspaces. Pick up where you left off or start a new track.
          </p>
        </section>

        {/* Quick Actions Header Section */}
        <section className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-y border-border/60 py-4 select-none">
          <div className="text-sm font-medium text-muted-foreground">Quick Actions</div>
          <div className="flex gap-3 items-center">
            <Button onClick={() => setCreateOpen(true)} size="sm" className="cursor-pointer">
              <Plus className="size-4 mr-1.5" />
              Create Workspace
            </Button>
            <Button onClick={() => setJoinOpen(true)} size="sm" variant="outline" className="cursor-pointer">
              <Users className="size-4 mr-1.5" />
              Join Workspace
            </Button>
          </div>
        </section>

        {/* Overview Cards Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Overview</h2>
          {isLoading && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border border-border">
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="size-10 rounded-lg shrink-0" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && !error && overview && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {/* Workspaces Card */}
              <Card className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 text-left select-none">
                <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
                      Workspaces
                    </span>
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                      {overview.totalWorkspaces}
                    </span>
                  </div>
                  <div className="size-8 sm:size-10 rounded-lg flex items-center justify-center bg-primary/5 border border-primary/10 text-primary shrink-0">
                    <Briefcase className="size-4 sm:size-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Documents Card */}
              <Card className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 text-left select-none">
                <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
                      Documents
                    </span>
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                      {overview.totalDocuments}
                    </span>
                  </div>
                  <div className="size-8 sm:size-10 rounded-lg flex items-center justify-center bg-primary/5 border border-primary/10 text-primary shrink-0">
                    <FileText className="size-4 sm:size-5" />
                  </div>
                </CardContent>
              </Card>

              {/* Files Card */}
              <Card className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 text-left select-none">
                <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block truncate">
                      Files
                    </span>
                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                      {overview.totalFiles}
                    </span>
                  </div>
                  <div className="size-8 sm:size-10 rounded-lg flex items-center justify-center bg-primary/5 border border-primary/10 text-primary shrink-0">
                    <HardDrive className="size-4 sm:size-5" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Continue Working Section */}
          <div id="continue-working" ref={continueWorkingRef} className="scroll-mt-14 space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Continue Working</h2>

            {isLoading && (
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32 mb-1.5" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="h-6" />
              </Card>
            )}

            {error && (
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4">
                <span className="text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  Failed to load continue working document.
                </span>
                <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !error && !recentDoc && (
              <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
                No recently opened documents found. Open a workspace to start drafting.
              </div>
            )}

            {!isLoading && !error && recentDoc && (
              <Card
                onClick={() => navigate(`/workspace/${recentDoc.workspaceId}/documents`)}
                className="border border-border/40 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 ease-premium cursor-pointer group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {recentDoc.workspaceName}
                    </span>
                    <span className="text-xs text-muted-foreground">{recentDoc.lastOpened}</span>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    {recentDoc.name}
                  </CardTitle>
                  <CardDescription>Click to reopen this document in the workspace.</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Workspace Grid Section */}
          <div id="workspaces" ref={workspacesRef} className="scroll-mt-14 space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Workspaces</h2>

            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="border border-border">
                    <CardHeader className="p-3 sm:p-4 pb-3">
                      <Skeleton className="h-5 w-32 sm:w-40 mb-1.5" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 sm:p-4">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4">
                <span className="text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  Failed to load workspaces.
                </span>
                <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !error && workspaces?.length === 0 && (
              <div className="p-8 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
                You are not a member of any workspaces yet. Create or join one above!
              </div>
            )}

            {!isLoading && !error && workspaces && workspaces.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4">
                {workspaces.map((workspace) => (
                  <Card
                    key={workspace.id}
                    onClick={() => navigate(`/workspace/${workspace.id}`)}
                    className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-200 ease-premium cursor-pointer flex flex-col justify-between group"
                  >
                    <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
                      <CardTitle className="text-sm sm:text-base font-bold group-hover:text-primary transition-colors truncate">
                        {workspace.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 min-h-10">
                        # {workspace.description}
                      </CardDescription>
                      <div className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                        <span className="font-semibold tracking-wider">@admin:</span>
                        <span className="truncate flex-1 max-w-full">{workspace.adminEmail}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground flex justify-between items-center border-t border-border/50 p-3 sm:p-4 pt-3 sm:pt-3">
                      <div className="flex gap-2 sm:gap-3.5 flex-wrap">
                        <span className="flex items-center gap-1" title={`${workspace.memberCount} Members`}>
                          <Users className="size-3.5 text-primary/80" />
                          <span>{workspace.memberCount}</span>
                          <span className="hidden sm:inline"> Members</span>
                        </span>
                        <span className="flex items-center gap-1" title={`${workspace.documentCount} Documents`}>
                          <FileText className="size-3.5 text-primary/80" />
                          <span>{workspace.documentCount}</span>
                          <span className="hidden sm:inline"> Docs</span>
                        </span>
                        <span className="flex items-center gap-1" title={`${workspace.fileCount} Files`}>
                          <HardDrive className="size-3.5 text-primary/80" />
                          <span>{workspace.fileCount}</span>
                          <span className="hidden sm:inline"> Files</span>
                        </span>
                      </div>
                      {workspace.lastActivity && (
                        <span className="text-[10px] font-semibold tracking-wider shrink-0 hidden sm:inline">
                          Active {workspace.lastActivity}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Recent Activity Section */}
        <div id="recent-activity" ref={recentActivityRef} className="scroll-mt-14 space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>

          {isLoading && (
            <Card className="border border-border p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-1.5 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </Card>
          )}

          {error && (
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col items-start gap-2">
              <span className="text-sm text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                Failed to load activity feed.
              </span>
              <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer mt-1">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && activity?.length === 0 && (
            <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              No recent workspace activity recorded.
            </div>
          )}

          {!isLoading && !error && activity && activity.length > 0 && (
            <Card className="border border-border/30 shadow-[0_1px_3px_rgba(0,0,0,0.01)] bg-card/75">
              <CardContent className="p-4 max-h-62.5 overflow-y-auto divide-y divide-border/60 scrollbar-none">
                {activity.map((item) => {
                  const formatted = formatActivity(item);
                  return (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 text-xs align-top text-left">
                      <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Activity className="size-3.5" />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-foreground leading-normal font-medium">
                          <span className="font-semibold text-muted-foreground mr-1">{formatted.actor}</span>
                          {formatted.action} <span className="font-semibold">{formatted.target}</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground tracking-wider font-semibold">
                          {formatActivityTime(formatted.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation for Dashboard */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border bg-background/80 backdrop-blur-md flex items-center justify-around px-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.03)] select-none">
        <button
          onClick={() => scrollToSection("overview")}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeSection === "overview"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Briefcase className="size-5 shrink-0" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => scrollToSection("continue-working")}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeSection === "continue-working"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="size-5 shrink-0" />
          <span>Continue</span>
        </button>
        <button
          onClick={() => scrollToSection("workspaces")}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeSection === "workspaces"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="size-5 shrink-0" />
          <span>Workspaces</span>
        </button>
        <button
          onClick={() => scrollToSection("recent-activity")}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 py-1 text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
            activeSection === "recent-activity"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Activity className="size-5 shrink-0" />
          <span>Activity</span>
        </button>
      </nav>

      {/* Create Workspace Dialog Form */}
      <CreateWorkspaceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(data) => {
          setInviteDetails(data)
          setInviteOpen(true)
        }}
      />

      {/* Join Workspace Dialog Form */}
      <JoinWorkspaceDialog open={joinOpen} onOpenChange={setJoinOpen} />

      {/* Invite Members Dialog Form */}
      <InviteMembersDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        inviteCode={inviteDetails?.inviteCode}
        workspaceId={inviteDetails?.id}
      />
    </div>
  )
}