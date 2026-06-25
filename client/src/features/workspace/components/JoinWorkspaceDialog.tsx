import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useJoinWorkspace } from "../hooks/useWorkspaceMutations"
import { joinWorkspaceSchema, type JoinWorkspaceFormData } from "../schemas/joinWorkspaceSchema"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"

interface JoinWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinWorkspaceDialog({ open, onOpenChange }: JoinWorkspaceDialogProps) {
  const { mutate: joinWorkspace, isPending, error } = useJoinWorkspace()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<JoinWorkspaceFormData>({
    resolver: zodResolver(joinWorkspaceSchema),
    defaultValues: {
      joinCode: "",
    },
  })

  const onSubmit = (data: JoinWorkspaceFormData) => {
    joinWorkspace(data.joinCode, {
      onSuccess: () => {
        toast.success("Successfully joined the workspace!")
        reset()
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to join workspace")
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
          <DialogTitle>Join Workspace</DialogTitle>
          <DialogDescription>
            Enter an existing workspace join code to gain access and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Server side error display */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error instanceof Error ? error.message : "Failed to join workspace"}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="join-code">Join Code</Label>
            <Input
              id="join-code"
              type="text"
              placeholder="e.g. ENG-123-ABC"
              disabled={isPending}
              {...register("joinCode")}
              className={errors.joinCode ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.joinCode && (
              <p className="text-xs font-medium text-destructive">{errors.joinCode.message}</p>
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
              {isPending ? "Joining..." : "Join Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
