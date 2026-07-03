import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useParams } from "react-router-dom"
import { toast } from "sonner"
import { useCreateDocument } from "../hooks/useWorkspaceDocuments"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"

export interface CreateDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId?: string
  onSuccess?: (data: { id: string }) => void
}

const documentSchema = z.object({
  title: z.string().min(1, "Document title is required").max(100, "Title is too long"),
  icon: z.string().optional(),
})

type DocumentFormData = z.infer<typeof documentSchema>

export function CreateDocumentDialog({ open, onOpenChange, workspaceId, onSuccess }: CreateDocumentDialogProps) {
  const { workspaceId: routeWorkspaceId } = useParams<{ workspaceId: string }>()
  const activeWorkspaceId = workspaceId || routeWorkspaceId || ""
  
  const { mutate: createDocument, isPending, error } = useCreateDocument(activeWorkspaceId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      icon: "",
    },
  })

  const selectedIcon = watch("icon")

  const onSubmit = (data: DocumentFormData) => {
    if (!activeWorkspaceId) {
      toast.error("Workspace context is missing.")
      return
    }
    createDocument(data, {
      onSuccess: (res) => {
        toast.success(`Document "${data.title}" created successfully!`)
        reset()
        onOpenChange(false)
        if (onSuccess && res) {
          onSuccess(res)
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create document")
      },
    })
  }

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left select-none">
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
          <DialogDescription>
            Documents allow you to write technical specifications, project structures, and share plans with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error instanceof Error ? error.message : "Failed to create document"}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="document-title">Document Title</Label>
            <Input
              id="document-title"
              type="text"
              placeholder="e.g. Sprint Specifications, Architecture Plan"
              disabled={isPending}
              {...register("title")}
              className={errors.title ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Document Icon (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {["📄", "📝", "📚", "📊", "🚀", "💡", "🧪", "⚙️", "💬", "📌"].map((emoji) => {
                const isSelected = selectedIcon === emoji
                return (
                  <button
                    key={emoji}
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setValue("icon", isSelected ? "" : emoji)
                    }}
                    className={`size-8 flex items-center justify-center text-lg rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 scale-105"
                        : "border-border hover:bg-muted hover:border-muted-foreground"
                    }`}
                  >
                    {emoji}
                  </button>
                )
              })}
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="cursor-pointer text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="cursor-pointer text-xs">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
              {isPending ? "Creating..." : "Create Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}