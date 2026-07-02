import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

interface NewDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewDocumentDialog({ open, onOpenChange }: NewDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left">
        <DialogHeader>
          <DialogTitle>New Document</DialogTitle>
          <DialogDescription>
            This is a structural placeholder for document creation. A future module will replace this view with the actual document creation form.
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