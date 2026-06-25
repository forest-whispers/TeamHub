import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"

interface DeleteDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentName: string
  onConfirm: () => void
  isPending: boolean
  errorMsg: string | null
}

export function DeleteDocumentDialog({
  open,
  onOpenChange,
  documentName,
  onConfirm,
  isPending,
  errorMsg,
}: DeleteDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left">
        <DialogHeader>
          <DialogTitle>Delete Document</DialogTitle>
          <DialogDescription className="text-xs pt-1.5">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{documentName}"</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This action is permanent and cannot be undone. You will lose all content and history associated with this document.
          </p>

          {errorMsg && (
            <div className="p-2.5 border border-destructive/20 bg-destructive/5 rounded-lg text-[11px] text-destructive flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={onConfirm}
            className="cursor-pointer min-w-[80px] flex items-center justify-center"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin shrink-0 mr-1.5" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
