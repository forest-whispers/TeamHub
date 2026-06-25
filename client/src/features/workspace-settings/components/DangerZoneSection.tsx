import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"

interface DangerZoneSectionProps {
  onLeaveWorkspace: () => void
  onDeleteWorkspace: () => void
}

export function DangerZoneSection({ onLeaveWorkspace, onDeleteWorkspace }: DangerZoneSectionProps) {
  return (
    <Card className="border border-destructive/30 bg-destructive/5 select-none text-left">
      <CardHeader className="p-4 pb-2 border-b border-destructive/20">
        <CardTitle className="text-sm font-bold text-destructive">
          Danger Zone
        </CardTitle>
        <CardDescription className="text-xs text-destructive/80 mt-0.5">
          Destructive and irreversible configuration parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-foreground block">
              Leave Workspace
            </span>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Remove yourself from this workspace. You will lose access to all documents, files, and chat history.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLeaveWorkspace}
            className="cursor-pointer border-destructive/30 hover:bg-destructive/10 text-destructive text-xs shrink-0 self-start sm:self-center"
          >
            Leave Workspace
          </Button>
        </div>

        <div className="border-t border-destructive/20 my-4" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-foreground block">
              Delete Workspace
            </span>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Permanently delete this workspace and all associated documents, chat timelines, activity histories, and shared assets.
            </p>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDeleteWorkspace}
            className="cursor-pointer text-xs shrink-0 self-start sm:self-center"
          >
            Delete Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
