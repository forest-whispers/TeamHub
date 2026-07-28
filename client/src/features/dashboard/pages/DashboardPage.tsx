import { useState } from "react"
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-left">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-border">
                <CardContent className="p-4 flex items-center justify-between gap-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Workspaces Card */}
            <Card className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 text-left select-none">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Workspaces
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-foreground truncate">
                    {overview.totalWorkspaces}
                  </span>
                </div>
                <div className="size-10 rounded-lg flex items-center justify-center bg-primary/5 border border-primary/10 text-primary shrink-0">
                  <Briefcase className="size-5" />
                </div>
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 text-left select-none">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Documents
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-foreground truncate">
                    {overview.totalDocuments}
                  </span>
                </div>
                <div className="size-10 rounded-lg flex items-center justify-center bg-primary/5 border border-primary/10 text-primary shrink-0">
                  <FileText className="size-5" />
                </div>
              </CardContent>
            </Card>

            {/* Files Card */}
            <Card className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] transition-all duration-200 text-left select-none">
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Files
                  </span>
                  <span className="text-2xl font-bold tracking-tight text-foreground truncate">
                    {overview.totalFiles}
                  </span>
                </div>
                <div className="size-10 rounded-lg flex items-center justify-center bg-primary/5 border border-primary/10 text-primary shrink-0">
                  <HardDrive className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Main Grid: Left column (Continue Working + Workspaces), Right column (Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Continue Working Section */}
          <section className="space-y-4">
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
          </section>

          {/* Workspace Grid Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Workspaces</h2>

            {isLoading && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workspaces.map((workspace) => (
                  <Card
                    key={workspace.id}
                    onClick={() => navigate(`/workspace/${workspace.id}`)}
                    className="border border-border/40 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-200 ease-premium cursor-pointer flex flex-col justify-between group"
                  >
                    <CardHeader className="pb-0">
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors">
                        {workspace.name}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 min-h-10">
                        # {workspace.description}
                      </CardDescription>
                      <div className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1">
                        <span className="font-semibold tracking-wider">@admin:</span>
                        <span className="truncate">{workspace.adminEmail}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground flex justify-between items-center border-t border-border/50 pt-3">
                      <div className="flex gap-3.5">
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5 text-primary/80" /> {workspace.memberCount} Members
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="size-3.5 text-primary/80" /> {workspace.documentCount} Documents
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="size-3.5 text-primary/80" /> {workspace.fileCount} Files
                        </span>
                      </div>
                      {workspace.lastActivity && (
                        <span className="text-[10px] font-semibold tracking-wider shrink-0">
                          Active {workspace.lastActivity}
                        </span>
                      )}
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
              <CardContent className="p-4 max-h-62.5 overflow-y-auto divide-y divide-border/60">
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