import { Button } from "@/shared/components/ui/button"
import { SettingsSection } from "./SettingsSection"
import { Users, Shield } from "lucide-react"

interface MembersSettingsSectionProps {
  totalMembers: number
  owner: string
  onManageMembers: () => void
}

export function MembersSettingsSection({
  totalMembers,
  owner,
  onManageMembers,
}: MembersSettingsSectionProps) {
  return (
    <SettingsSection
      title="Members Summary"
      description="View workspace collaborative membership summary"
    >
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
    </SettingsSection>
  )
}
