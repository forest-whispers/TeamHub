import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

interface InviteMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMembersDialog({ open, onOpenChange }: InviteMembersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left">
        <DialogHeader>
          <DialogTitle>Invite Members</DialogTitle>
          <DialogDescription>
            This is a structural placeholder for member invitation. A future collaboration feature will replace this view with actual invite controls.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 flex justify-end">
          <Button onClick={() => onOpenChange(false)} className="cursor-pointer">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
