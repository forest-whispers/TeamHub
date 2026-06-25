import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStatus } from "../../auth/hooks/useAuthStatus"
import { useContinueWorking, useWorkspaces, useRecentActivity } from "../hooks/useDashboard"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { FileText, Plus, Users, Activity, AlertCircle, FileCode } from "lucide-react"
import { CreateWorkspaceDialog } from "../../workspace/components/CreateWorkspaceDialog"
import { JoinWorkspaceDialog } from "../../workspace/components/JoinWorkspaceDialog"


export default function DashboardPage() {
  const navigate = useNavigate()
  const { data: authStatus } = useAuthStatus()

  // Queries
  const {
    data: recentDoc,
    isLoading: loadingDoc,
    error: errorDoc,
    refetch: refetchDoc,
  } = useContinueWorking()
  const {
    data: workspaces,
    isLoading: loadingWorkspaces,
    error: errorWorkspaces,
    refetch: refetchWorkspaces,
  } = useWorkspaces()
  const {
    data: activity,
    isLoading: loadingActivity,
    error: errorActivity,
    refetch: refetchActivity,
  } = useRecentActivity()

  // Modal Dialog States
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  const userName = authStatus?.user?.name || "Member"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* Greeting Banner */}
      <section className="space-y-1.5">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Welcome back, {userName}
        </h1>
        <p className="text-muted-foreground text-sm">
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
          <Button
            onClick={() => {
              localStorage.removeItem("teamhub-mock-authenticated")
              navigate("/")
              window.location.reload()
            }}
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive cursor-pointer ml-1.5"
          >
            Log Out
          </Button>
        </div>
      </section>

      {/* Main Grid: Left column (Continue Working + Workspaces), Right column (Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Continue Working Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Continue Working</h2>

            {loadingDoc && (
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32 mb-1.5" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="h-6" />
              </Card>
            )}

            {errorDoc && (
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4">
                <span className="text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  Failed to load continue working document.
                </span>
                <Button size="xs" variant="outline" onClick={() => refetchDoc()} className="cursor-pointer">
                  Retry
                </Button>
              </div>
            )}

            {!loadingDoc && !errorDoc && !recentDoc && (
              <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
                No recently opened documents found. Open a workspace to start drafting.
              </div>
            )}

            {!loadingDoc && !errorDoc && recentDoc && (
              <Card
                onClick={() => navigate(`/workspace/${recentDoc.workspaceId}`)}
                className="border border-border hover:border-border/80 transition-colors cursor-pointer group"
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
          </section>

          {/* Workspace Grid Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Workspaces</h2>

            {loadingWorkspaces && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="border border-border">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-40 mb-1.5" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {errorWorkspaces && (
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4">
                <span className="text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  Failed to load workspaces.
                </span>
                <Button size="xs" variant="outline" onClick={() => refetchWorkspaces()} className="cursor-pointer">
                  Retry
                </Button>
              </div>
            )}

            {!loadingWorkspaces && !errorWorkspaces && workspaces?.length === 0 && (
              <div className="p-8 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
                You are not a member of any workspaces yet. Create or join one above!
              </div>
            )}

            {!loadingWorkspaces && !errorWorkspaces && workspaces && workspaces.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspaces.map((workspace) => (
                  <Card
                    key={workspace.id}
                    onClick={() => navigate(`/workspace/${workspace.id}`)}
                    className="border border-border hover:border-border/80 transition-colors cursor-pointer flex flex-col justify-between group"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                        {workspace.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 min-h-10">
                        {workspace.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground flex justify-between items-center border-t border-border/50 pt-3">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="size-3" /> {workspace.memberCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileCode className="size-3" /> {workspace.documentCount}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold tracking-wider">
                        Active {workspace.lastActivity}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: Recent Activity Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>

          {loadingActivity && (
            <Card className="border border-border p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col gap-1.5 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </Card>
          )}

          {errorActivity && (
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex flex-col items-start gap-2">
              <span className="text-sm text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                Failed to load activity feed.
              </span>
              <Button size="xs" variant="outline" onClick={() => refetchActivity()} className="cursor-pointer mt-1">
                Retry
              </Button>
            </div>
          )}

          {!loadingActivity && !errorActivity && activity?.length === 0 && (
            <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              No recent workspace activity recorded.
            </div>
          )}

          {!loadingActivity && !errorActivity && activity && activity.length > 0 && (
            <Card className="border border-border">
              <CardContent className="p-4 divide-y divide-border/60">
                {activity.map((item) => (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex gap-3 text-xs align-top">
                    <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="size-3.5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-foreground font-medium leading-normal">
                        <span className="font-semibold text-muted-foreground mr-1">{item.actor}</span>
                        {item.action} <span className="font-semibold">{item.target}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        {item.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Workspace Dialog Form */}
      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Join Workspace Dialog Form */}
      <JoinWorkspaceDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  )
}
