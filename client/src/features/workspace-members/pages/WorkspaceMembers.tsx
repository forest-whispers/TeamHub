import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useWorkspaceMembers, useWorkspaceMemberDetails } from "../hooks/useWorkspaceMembers"
import { InviteMembersDialog } from "../components/InviteMembersDialog"
import { MemberDetailsPanel } from "../components/MemberDetailsPanel"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import { toast } from "sonner"
import { Search, Filter, UserPlus, Mail, Shield, AlertCircle, Users2, HelpCircle } from "lucide-react"

export default function WorkspaceMembers() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const {
    data: members,
    isLoading,
    error,
    refetch,
  } = useWorkspaceMembers(workspaceId || "")

  const {
    data: memberDetails,
    isLoading: isDetailsLoading,
    error: detailsError,
    refetch: refetchDetails,
  } = useWorkspaceMemberDetails(workspaceId || "", selectedMemberId || "")

  // Unique roles extraction from loaded members for filter dropdown options
  const roleOptions = useMemo(() => {
    if (!members) return []
    const roles = new Set(members.map((m) => m.role).filter(Boolean))
    return Array.from(roles).sort()
  }, [members])

  // Client-side search and filter operations
  const filteredMembers = useMemo(() => {
    if (!members) return []
    return members.filter((member) => {
      const memberName = member.name || ""
      const memberEmail = member.email || ""
      const memberRole = member.role || ""

      const matchesSearch =
        memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memberEmail.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRole =
        roleFilter === "all" ||
        memberRole.toLowerCase() === roleFilter.toLowerCase()

      return matchesSearch && matchesRole
    })
  }, [members, searchQuery, roleFilter])

  // Avatar initials helper
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Consistent, premium background colors for avatar initials based on name hash
  const getAvatarBgColor = (name: string) => {
    const colors = [
      "bg-red-500/10 text-red-500 border-red-500/20",
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "bg-green-500/10 text-green-500 border-green-500/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-teal-500/10 text-teal-500 border-teal-500/20",
      "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      "bg-sky-500/10 text-sky-500 border-sky-500/20",
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "bg-violet-500/10 text-violet-500 border-violet-500/20",
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20",
      "bg-pink-500/10 text-pink-500 border-pink-500/20",
      "bg-rose-500/10 text-rose-500 border-rose-500/20",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  // Get status color mappings
  const getStatusColor = (status: "online" | "away" | "offline") => {
    switch (status) {
      case "online":
        return "bg-emerald-500"
      case "away":
        return "bg-amber-500"
      case "offline":
        return "bg-muted-foreground/45"
      default:
        return "bg-muted-foreground/45"
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-left select-none">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Members</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and view members collaborative workspace settings
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          size="sm"
          className="cursor-pointer gap-1.5 shrink-0 self-start sm:self-center"
        >
          <UserPlus className="size-4" />
          Invite Members
        </Button>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input wrapper */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Role Filter dropdown */}
        <SelectDropdown
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "All Roles" },
            ...roleOptions.map((role) => ({
              value: role.toLowerCase(),
              label: role,
            })),
          ]}
          icon={<Filter className="size-3.5" />}
        />
      </div>

      {/* Loading Skeleton block */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="border border-border/50 bg-card">
              <CardContent className="p-4 flex items-start gap-3">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fetching Error State view */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
            <span className="text-sm text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              Failed to load workspace members list.
            </span>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loaded Content grid */}
      {!isLoading && !error && members && (
        <>
          {filteredMembers.length === 0 ? (
            /* Empty State layout */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-xl bg-card/25 min-h-[300px]">
              {members.length === 0 ? (
                <>
                  <Users2 className="size-12 text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No members in workspace</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    This workspace does not contain any collaborative members yet. Use the invitation options to add members.
                  </p>
                  <Button
                    onClick={() => setInviteOpen(true)}
                    size="xs"
                    variant="outline"
                    className="mt-4 cursor-pointer"
                  >
                    Invite First Member
                  </Button>
                </>
              ) : (
                <>
                  <HelpCircle className="size-12 text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No matches found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    Your search query or role filter didn't match any members in this workspace. Try adjusting your settings.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setRoleFilter("all")
                    }}
                    size="xs"
                    variant="outline"
                    className="mt-4 cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            /* Member Card Grid list */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((member) => (
                <Card
                  key={member.id}
                  tabIndex={0}
                  onClick={() => setSelectedMemberId(member.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelectedMemberId(member.id)
                    }
                  }}
                  className="border border-border bg-card/45 hover:bg-card hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none transition-all duration-200 text-left overflow-hidden cursor-pointer"
                >
                  <CardContent className="p-4 flex items-start gap-3 relative">
                    {/* Dynamic colored avatar with initials and online status badge */}
                    <div className="relative shrink-0 select-none">
                      <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs border ${getAvatarBgColor(member.name)}`}>
                        {getInitials(member.name)}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-card ${getStatusColor(member.status)}`}
                        title={member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      />
                    </div>

                    {/* Member Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-semibold text-sm text-foreground truncate block leading-tight">
                          {member.name}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground truncate leading-none">
                        <Mail className="size-3 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </span>

                      {/* Role indicator badge */}
                      <div className="pt-1 flex items-center gap-1 select-none">
                        <Shield className="size-3 text-primary/75 shrink-0" />
                        <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 rounded px-1.5 py-0.25 leading-none">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Invite overlay Dialog container */}
      <InviteMembersDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Member Details side panel */}
      <MemberDetailsPanel
        open={selectedMemberId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedMemberId(null)
        }}
        isLoading={isDetailsLoading}
        error={detailsError}
        memberDetails={memberDetails || null}
        onRetry={refetchDetails}
        onSendMessage={() => toast.success("Send Message is a placeholder action.")}
        onViewActivity={() => toast.success("View Activity is a placeholder action.")}
      />
    </div>
  )
}
