import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { SettingsSection } from "./SettingsSection"
import { SettingsField } from "./SettingsField"
import { Input } from "@/shared/components/ui/input"
import { Users, Shield, Clipboard, Check, RotateCw } from "lucide-react"
import { toast } from "sonner"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import type { WorkspaceMember } from "@/features/workspace/types"

interface MembersSettingsSectionProps {
  totalMembers: number
  owner: string
  inviteCode?: string
  isRegenerating?: boolean
  onRegenerateInviteCode?: () => void
  members: WorkspaceMember[]
  currentUserId: string
  onUpdateRole: (userId: string, role: string) => void
  isUpdatingRole: boolean
}

export function MembersSettingsSection({
  totalMembers,
  owner,
  inviteCode,
  isRegenerating = false,
  onRegenerateInviteCode,
  members,
  currentUserId,
  onUpdateRole,
  isUpdatingRole,
}: MembersSettingsSectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      toast.success("Invite code copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy invite code")
    }
  }

  // Determine current user role & administrative rights
  const currentUserMember = members.find((m) => m.id === currentUserId)
  const currentUserRole = currentUserMember?.role
  const isRequesterAdmin = currentUserRole === "OWNER" || currentUserRole === "ADMIN"

  return (
    <SettingsSection
      title="Members Summary"
      description="View workspace collaborative membership summary"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Members */}
          <div className="flex items-center gap-3 border border-border/40 bg-background/20 rounded-lg p-3">
            <div className="size-8 rounded-lg border border-primary/20 bg-primary/5 text-primary flex items-center justify-center shrink-0">
              <Users className="size-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Total Members
              </span>
              <span className="text-sm font-semibold text-foreground">
                {totalMembers} Member{totalMembers !== 1 && "s"}
              </span>
            </div>
          </div>

          {/* Owner */}
          <div className="flex items-center gap-3 border border-border/40 bg-background/20 rounded-lg p-3">
            <div className="size-8 rounded-lg border border-violet-500/20 bg-violet-500/5 text-violet-500 flex items-center justify-center shrink-0">
              <Shield className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Workspace Owner
              </span>
              <span className="text-sm font-semibold text-foreground truncate block">
                {owner}
              </span>
            </div>
          </div>
        </div>

        {/* Invite Code */}
        {inviteCode && (
          <SettingsField
            label="Invite Code"
            description="Share this code with team members so they can join your workspace."
          >
            <div className="flex gap-2 max-w-md select-none pt-1">
              <Input
                readOnly
                value={inviteCode}
                className="font-mono text-xs font-semibold bg-muted/20"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="cursor-pointer shrink-0"
                title="Copy Invite Code"
              >
                {copied ? <Check className="size-4 text-green-500" /> : <Clipboard className="size-4" />}
              </Button>
              {onRegenerateInviteCode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRegenerateInviteCode}
                  disabled={isRegenerating}
                  className="cursor-pointer text-xs flex gap-1.5 items-center shrink-0"
                  title="Regenerate Invite Code"
                >
                  <RotateCw className={`size-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              )}
            </div>
          </SettingsField>
        )}

        {/* Workspace Members list and role modifier */}
        <SettingsField
          label="Workspace Members"
          description="View and manage roles of users in this workspace."
        >
          <div className="border border-border/50 rounded-lg overflow-hidden bg-background/5 mt-3">
            <div className="max-h-75 overflow-y-auto divide-y divide-border/40 scrollbar-thin">
              {members.map((member) => {
                const isOwner = member.role === "OWNER"
                const options = isOwner
                  ? [{ value: "OWNER", label: "Owner" }]
                  : [
                      { value: "ADMIN", label: "Admin" },
                      { value: "MEMBER", label: "Member" },
                    ]
                const isDisabled = !isRequesterAdmin || isOwner || isUpdatingRole

                // Avatar initials helper
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-foreground block truncate">
                          {member.name} {member.id === currentUserId && "(You)"}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {member.email}
                        </span>
                      </div>
                    </div>

                    <SelectDropdown
                      value={member.role}
                      onChange={(newRole) => onUpdateRole(member.id, newRole)}
                      options={options}
                      disabled={isDisabled}
                      className="w-28 shrink-0"
                      align="right"
                      icon={<Shield className="size-3 text-muted-foreground" />}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </SettingsField>
      </div>
    </SettingsSection>
  )
}