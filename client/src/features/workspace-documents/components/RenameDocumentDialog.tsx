import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"

interface RenameDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentName: string
  onRename: (newName: string) => void
  isPending: boolean
  errorMsg: string | null
}

export function RenameDocumentDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
  isPending,
  errorMsg,
}: RenameDocumentDialogProps) {
  const [name, setName] = useState(currentName)

  // Sync state with prop when dialog opens
  useEffect(() => {
    if (open) {
      setName(currentName)
    }
  }, [open, currentName])

  const trimmedName = name.trim()
  const isNameEmpty = trimmedName.length === 0
  const isNameTooLong = trimmedName.length > 100
  const isUnchanged = trimmedName === currentName.trim()

  const isValid = !isNameEmpty && !isNameTooLong
  const canSave = isValid && !isUnchanged && !isPending

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onRename(trimmedName)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left">
        <form onSubmit={handleSave} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Enter a new name for your document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="doc-name" className="text-xs font-semibold">
              Document Name
            </Label>
            <Input
              id="doc-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              maxLength={105}
              className="text-xs h-9"
              placeholder="e.g. API Guidelines"
            />
            {isNameEmpty && name.length > 0 && (
              <p className="text-[10px] text-destructive">Document name cannot be blank.</p>
            )}
            {trimmedName.length > 100 && (
              <p className="text-[10px] text-destructive">Document name cannot exceed 100 characters.</p>
            )}
          </div>

          {errorMsg && (
            <div className="p-2 border border-destructive/20 bg-destructive/5 rounded text-[11px] text-destructive flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <DialogFooter className="pt-2 flex justify-end gap-2">
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
              type="submit"
              size="sm"
              disabled={!canSave}
              className="cursor-pointer min-w-[70px] flex items-center justify-center"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin shrink-0 mr-1.5" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
