import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { SettingsSection } from "./SettingsSection"
import { SettingsField } from "./SettingsField"
import { Input } from "@/shared/components/ui/input"
import { Users, Shield, Clipboard, Check, RotateCw } from "lucide-react"
import { toast } from "sonner"

interface MembersSettingsSectionProps {
  totalMembers: number
  owner: string
  inviteCode?: string
  isRegenerating?: boolean
  onRegenerateInviteCode?: () => void
  onManageMembers: () => void
}

export function MembersSettingsSection({
  totalMembers,
  owner,
  inviteCode,
  isRegenerating = false,
  onRegenerateInviteCode,
  onManageMembers,
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

        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onManageMembers}
            className="cursor-pointer text-xs"
          >
            Manage Members
          </Button>
        </div>
      </div>
    </SettingsSection>
  )
}
