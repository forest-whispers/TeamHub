import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Clipboard, Check } from "lucide-react"

interface InviteMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inviteCode?: string
  workspaceId?: string
}

export function InviteMembersDialog({ open, onOpenChange, inviteCode, workspaceId }: InviteMembersDialogProps) {
  const navigate = useNavigate()
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

  const handleGoToWorkspace = () => {
    if (workspaceId) {
      navigate(`/workspace/${workspaceId}`)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left select-none">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            Invite members to join your workspace by sharing this unique invite code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              readOnly
              value={inviteCode || ""}
              placeholder={inviteCode ? "" : "Generating code..."}
              className="font-mono text-center text-sm font-semibold tracking-wider bg-muted/40"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
              disabled={!inviteCode}
              className="cursor-pointer shrink-0"
              title="Copy Invite Code"
            >
              {copied ? <Check className="size-4 text-green-500" /> : <Clipboard className="size-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal text-center">
            New members can enter this code in the "Join Workspace" dialog on their dashboard to join this workspace.
          </p>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            Skip
          </Button>
          {workspaceId && (
            <Button
              type="button"
              onClick={handleGoToWorkspace}
              className="cursor-pointer text-xs"
            >
              Go to Workspace
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}