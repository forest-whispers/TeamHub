import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useCreateWorkspace } from "../hooks/useWorkspaceMutations"
import { workspaceSchema, type WorkspaceFormData } from "../schemas/workspaceSchema"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (data: { id: string; inviteCode: string }) => void
}

const colors = [
  { name: "Indigo", value: "indigo", class: "bg-indigo-600 dark:bg-indigo-500" },
  { name: "Blue", value: "blue", class: "bg-blue-600 dark:bg-blue-500" },
  { name: "Purple", value: "purple", class: "bg-purple-600 dark:bg-purple-500" },
  { name: "Green", value: "green", class: "bg-emerald-600 dark:bg-emerald-500" },
  { name: "Orange", value: "orange", class: "bg-orange-600 dark:bg-orange-500" },
]

export function CreateWorkspaceDialog({ open, onOpenChange, onSuccess }: CreateWorkspaceDialogProps) {
  const { mutate: createWorkspace, isPending, error } = useCreateWorkspace()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      description: "",
      accentColor: "indigo",
    },
  })

  const selectedColor = watch("accentColor")

  const onSubmit = (data: WorkspaceFormData) => {
    createWorkspace(data, {
      onSuccess: (res) => {
        toast.success(`Workspace "${data.name}" created successfully!`)
        reset()
        onOpenChange(false)
        if (onSuccess && res) {
          onSuccess(res)
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create workspace")
      },
    })
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-left">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Workspaces help you group collaborative documents and discuss with team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Server side error display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error instanceof Error ? error.message : "Failed to create workspace"}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              type="text"
              placeholder="e.g. Acme Marketing, Project Titan"
              disabled={isPending}
              {...register("name")}
              className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="workspace-description">Description (optional)</Label>
            <Input
              id="workspace-description"
              type="text"
              placeholder="What is this workspace about?"
              disabled={isPending}
              {...register("description")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Accent Color</Label>
            <div className="flex gap-3 pt-1 select-none">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue("accentColor", color.value)}
                  disabled={isPending}
                  className={`size-7 rounded-full ${color.class} cursor-pointer transition-all border-2 ${
                    selectedColor === color.value
                      ? "border-foreground ring-2 ring-primary/40 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  title={color.name}
                />
              ))}
            </div>
            {errors.accentColor && (
              <p className="text-xs font-medium text-destructive">{errors.accentColor.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4 flex flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="cursor-pointer">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
              {isPending ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
