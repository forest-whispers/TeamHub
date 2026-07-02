import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace"
import { useWorkspaceHome } from "../hooks/useWorkspaceHome"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { NewDocumentDialog } from "../components/NewDocumentDialog"
import { InviteMembersDialog } from "../components/InviteMembersDialog"
import {
  Plus,
  Users,
  FileText,
  Activity,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react"

export default function WorkspaceHome() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()

  // Queries
  const {
    data: workspace,
    isLoading: loadingWorkspace,
    error: errorWorkspace,
    refetch: refetchWorkspace,
  } = useWorkspace(workspaceId!)

  const {
    data: home,
    isLoading: loadingHome,
    error: errorHome,
    refetch: refetchHome,
  } = useWorkspaceHome(workspaceId!)

  const members = workspace?.members ?? [];
  const recentDocs = home?.recentDocuments ?? [];
  const activities = home?.recentActivity ?? [];

  // Modal states
  const [newDocOpen, setNewDocOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Workspace Overview Section */}
      {loadingWorkspace && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left select-none space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      )}

      {errorWorkspace && (
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 mb-8 text-left">
          <span className="text-sm text-destructive font-medium flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            Failed to load workspace summary.
          </span>
          <Button size="xs" variant="outline" onClick={() => refetchWorkspace()} className="cursor-pointer">
            Retry
          </Button>
        </div>
      )}

      {!loadingWorkspace && !errorWorkspace && workspace && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8 text-left select-none relative overflow-hidden">
          <div className="absolute right-0 top-0 bg-primary/5 size-40 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-2 text-foreground">
            {workspace.name}
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mb-4 leading-relaxed">
            {workspace.description}
          </p>
          <div className="flex gap-4 text-xs font-semibold text-muted-foreground select-none">
            <div className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              <span>{members?.length} Members</span>
            </div>
            {workspace.onlineCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{workspace.onlineCount} Online Now</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Row Grid: Continue Working & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Continue Working Section */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-left">Continue Working</h2>
          
          {loadingHome && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <Card key={i} className="border border-border">
                  <CardHeader className="pb-3 text-left">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          {errorHome && (
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 text-left">
              <span className="text-sm text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                Failed to load recent documents.
              </span>
              <Button size="xs" variant="outline" onClick={() => refetchHome()} className="cursor-pointer">
                Retry
              </Button>
            </div>
          )}

          {!loadingHome && !errorHome && (!recentDocs || recentDocs.length === 0) && (
            <div className="p-8 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              No recently opened documents. Click "New Document" to get started.
            </div>
          )}

          {!loadingHome && !errorHome && recentDocs && recentDocs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentDocs.map((doc) => (
                <Card
                  key={doc.id}
                  onClick={() => navigate(`/workspace/${workspaceId}/documents`)}
                  className="border border-border hover:border-border/80 transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <CardHeader className="pb-3 text-left">
                    <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{doc.name}</span>
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      Edited by {doc.lastEditedBy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-[10px] text-muted-foreground border-t border-border/50 pt-2 flex justify-between items-center select-none uppercase font-semibold tracking-wider">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {doc.lastEdited}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary flex items-center gap-0.5">
                      View <ArrowRight className="size-3" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-left select-none opacity-0 pointer-events-none hidden lg:block">Actions</h2>
          <Card className="border border-border">
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-xs">Common workspace actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-1 text-left select-none">
              <Button onClick={() => setNewDocOpen(true)} className="w-full justify-start cursor-pointer text-xs" size="sm">
                <Plus className="size-4 mr-2" />
                New Document
              </Button>
              <Button onClick={() => setInviteOpen(true)} className="w-full justify-start cursor-pointer text-xs" variant="outline" size="sm">
                <Users className="size-4 mr-2" />
                Invite Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row Grid: Recent Activity & Members list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold tracking-tight text-left">Recent Activity</h2>

          {loadingHome && (
            <Card className="border border-border p-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-7 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {errorHome && (
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 text-left">
              <span className="text-sm text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                Failed to load recent activity feed.
              </span>
              <Button size="xs" variant="outline" onClick={() => refetchHome()} className="cursor-pointer">
                Retry
              </Button>
            </div>
          )}

          {!loadingHome && !errorHome && (!activities || activities.length === 0) && (
            <div className="p-6 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              No recent activity recorded.
            </div>
          )}

          {!loadingHome && !errorHome && activities && activities.length > 0 && (
            <Card className="border border-border">
              <CardContent className="p-4 divide-y divide-border/60">
                {activities.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3 text-xs align-top text-left">
                    <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="size-3.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-foreground leading-normal font-medium">
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

        {/* Members Overview Panel */}
        <div className="lg:col-span-1 space-y-3">
          {loadingWorkspace && (
            <Card className="border border-border">
              <CardHeader className="pb-3 text-left">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {errorWorkspace && (
            <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 text-left">
              <span className="text-sm text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                Failed to load members list.
              </span>
              <Button size="xs" variant="outline" onClick={() => refetchWorkspace()} className="cursor-pointer">
                Retry
              </Button>
            </div>
          )}

          {!loadingWorkspace && !errorWorkspace && (!members || members.length === 0) && (
            <Card className="border border-border">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Members</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center text-sm text-muted-foreground border-t border-border/50">
                No collaborators in this workspace.
              </CardContent>
            </Card>
          )}

          {!loadingWorkspace && !errorWorkspace && members && members.length > 0 && (
            <Card className="border border-border">
              <CardHeader className="pb-3 text-left">
                <CardTitle className="text-sm font-bold tracking-tight uppercase text-muted-foreground">Members</CardTitle>
                <CardDescription className="text-xs">Workspace collaborators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-1 text-left border-t border-border/50">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 text-sm">
                    <div className="relative select-none shrink-0">
                      <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20">
                        {member.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      {member.status && (
                        <span
                          className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card ${
                            member.status === "online"
                              ? "bg-emerald-500"
                              : member.status === "away"
                              ? "bg-amber-500"
                              : "bg-muted-foreground/45"
                          }`}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <span className="truncate">{member.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action dialog modals */}
      <NewDocumentDialog open={newDocOpen} onOpenChange={setNewDocOpen} />
      <InviteMembersDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}