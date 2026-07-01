import { Dialog as DialogPrimitive } from "radix-ui"
import { Dialog, DialogPortal, DialogOverlay } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { X, MessageSquare, Activity, AlertCircle } from "lucide-react"
import { MemberProfileSection } from "./MemberProfileSection"
import { MemberInfoRow } from "./MemberInfoRow"
import { Skeleton } from "@/shared/components/ui/skeleton"
import type { WorkspaceMemberDetails } from "../types"

interface MemberDetailsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  error: any
  memberDetails: WorkspaceMemberDetails | null
  onSendMessage?: () => void
  onViewActivity?: () => void
  onRetry?: () => void
}

export function MemberDetailsPanel({
  open,
  onOpenChange,
  isLoading,
  error,
  memberDetails,
  onSendMessage,
  onViewActivity,
  onRetry,
}: MemberDetailsPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full sm:max-w-md h-full bg-popover p-6 shadow-2xl border-l border-border outline-none transition-all duration-300 animate-in slide-in-from-right">
          {/* Close button */}
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-4 right-4 rounded-sm opacity-75 hover:opacity-100 cursor-pointer"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>

          {/* Header Title */}
          <div className="mb-6 select-none">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Member Profile</h2>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="flex-1 flex flex-col items-center space-y-6 pt-10 select-none">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2.5 w-full flex flex-col items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-4.5 w-32" />
              </div>
              <div className="w-full space-y-4 pt-6">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {!isLoading && error && (
            <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4 select-none">
              <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-full">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-foreground">Failed to load details</h4>
                <p className="text-xs text-muted-foreground">
                  There was an error loading the member details profile.
                </p>
              </div>
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry} className="cursor-pointer">
                  Retry
                </Button>
              )}
            </div>
          )}

          {/* Loaded details */}
          {!isLoading && !error && memberDetails && (
            <div className="flex-1 flex flex-col overflow-y-auto pr-1">
              <MemberProfileSection
                name={memberDetails.name}
                email={memberDetails.email}
                role={memberDetails.role}
                status={memberDetails.status}
                lastActive={memberDetails.lastActive}
              />

              <div className="py-5 space-y-1">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 select-none">
                  Member Metadata
                </h4>
                <MemberInfoRow label="Email Address" value={memberDetails.email} />
                <MemberInfoRow label="Workspace Role" value={memberDetails.role} />
                {memberDetails.joinedDate && <MemberInfoRow label="Joined Date" value={memberDetails.joinedDate} />}
                {memberDetails.lastActive && <MemberInfoRow label="Last Active" value={memberDetails.lastActive} />}
              </div>

              {memberDetails.bio && (
                <div className="pb-6">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 select-none">
                    Biography
                  </h4>
                  <p className="text-xs font-normal text-muted-foreground bg-muted/40 border border-border/30 p-3.5 rounded-lg leading-relaxed select-text">
                    {memberDetails.bio}
                  </p>
                </div>
              )}

              {/* Action placeholders */}
              <div className="mt-auto pt-6 border-t border-border flex flex-col gap-2 shrink-0 select-none">
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSendMessage}
                  className="w-full cursor-pointer gap-1.5"
                >
                  <MessageSquare className="size-4" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewActivity}
                  className="w-full cursor-pointer gap-1.5"
                >
                  <Activity className="size-4" />
                  View Activity
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
