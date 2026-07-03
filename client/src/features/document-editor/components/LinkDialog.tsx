import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Trash } from "lucide-react"

interface LinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialUrl: string
  onSave: (url: string) => void
  onRemove?: () => void
}

export function LinkDialog({ open, onOpenChange, initialUrl, onSave, onRemove }: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl)
  const [error, setError] = useState("")

  useEffect(() => {
    setUrl(initialUrl)
    setError("")
  }, [initialUrl, open])

  const validateAndNormalize = (input: string): string | null => {
    const trimmed = input.trim()
    if (!trimmed) {
      setError("URL is required")
      return null
    }

    // Prepend https:// if no protocol is present
    let normalized = trimmed
    if (!/^https?:\/\//i.test(trimmed) && !/^mailto:/i.test(trimmed) && !/^tel:/i.test(trimmed)) {
      normalized = `https://${trimmed}`
    }

    // Simple URL regex check
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i
    if (!urlPattern.test(normalized)) {
      setError("Please enter a valid URL")
      return null
    }

    return normalized
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = validateAndNormalize(url)
    if (normalized) {
      onSave(normalized)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm text-left select-none">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold">Edit Link</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="link-url" className="text-xs">URL Address</Label>
            <Input
              id="link-url"
              type="text"
              placeholder="e.g. google.com, https://linear.app"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setError("")
              }}
              className={`h-8 text-xs ${error ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
              autoFocus
            />
            {error && (
              <p className="text-[10px] font-medium text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter className="pt-2 flex flex-row gap-2 justify-between items-center">
            <div>
              {onRemove && initialUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    onRemove()
                    onOpenChange(false)
                  }}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 cursor-pointer text-xs"
                >
                  <Trash className="size-3 mr-1.5 shrink-0" />
                  Remove
                </Button>
              )}
            </div>
            <div className="flex gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer h-7 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="xs" className="cursor-pointer h-7 text-xs">
                Save
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}