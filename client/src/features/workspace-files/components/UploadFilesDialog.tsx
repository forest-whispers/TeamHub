import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"

interface UploadFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadFilesDialog({ open, onOpenChange }: UploadFilesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            This is a structural placeholder for file uploads. A future file management feature will integrate direct upload, drag-and-drop, and progress bars.
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
