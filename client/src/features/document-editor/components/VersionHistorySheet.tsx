import { useState, useEffect } from "react"
import { intlFormatDistance } from "date-fns"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useSnapshots, useSnapshotDetail } from "../hooks/useSnapshots"
import { useSaveDocument } from "../hooks/useSaveDocument"
import { SnapshotReadOnlyEditor } from "./SnapshotReadOnlyEditor"
import { Clock, RotateCcw, AlertCircle, User as UserIcon, History, Loader2 } from "lucide-react"
import { toast } from "sonner"
import * as Y from "yjs"
import { TiptapTransformer } from "@hocuspocus/transformer"

interface VersionHistorySheetProps {
  workspaceId: string
  documentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  ydoc?: Y.Doc
}

export function VersionHistorySheet({
  workspaceId,
  documentId,
  open,
  onOpenChange,
  ydoc,
}: VersionHistorySheetProps) {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const { mutate: saveDocument, isPending: isRestoring } = useSaveDocument()

  const {
    data: snapshots,
    isLoading: isLoadingList,
    error: listError,
    refetch: refetchList,
  } = useSnapshots(workspaceId, documentId, open)

  // Auto-select the most recent snapshot when snapshots list loads
  useEffect(() => {
    if (snapshots && snapshots.length > 0 && !selectedSnapshotId) {
      setSelectedSnapshotId(snapshots[0].id)
    }
  }, [snapshots, selectedSnapshotId])

  // Reset selected snapshot when sheet closes or document changes
  useEffect(() => {
    if (!open) {
      setSelectedSnapshotId(null)
      setIsConfirmOpen(false)
    }
  }, [open, documentId])

  const {
    data: snapshotDetail,
    isLoading: isLoadingDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useSnapshotDetail(workspaceId, documentId, selectedSnapshotId, open)

  const getAvatarBgColor = (name: string) => {
    const colors = [
      "bg-red-500/10 text-red-500 border-red-500/20",
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
      "bg-amber-500/10 text-amber-500 border-amber-500/20",
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "bg-pink-500/10 text-pink-500 border-pink-500/20",
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }

  const handleRestoreClick = () => {
    if (!snapshotDetail) return
    setIsConfirmOpen(true)
  }

  const handleConfirmRestore = () => {
    if (!snapshotDetail || !snapshotDetail.state) return

    try {
      // 1. Reconstruct an isolated temporary Y.Doc from snapshot state
      const tempYdoc = new Y.Doc()
      const snapshotBytes = new Uint8Array(snapshotDetail.state)
      Y.applyUpdateV2(tempYdoc, snapshotBytes)

      // 2. Convert reconstructed Y.Doc to Tiptap JSON
      const restoredContent = TiptapTransformer.fromYdoc(tempYdoc, "default")
      tempYdoc.destroy()

      // 3. Update the live collaborative Y.Doc if available
      if (ydoc) {
        const xmlFragment = ydoc.getXmlFragment("default")
        if (xmlFragment.length > 0) {
          xmlFragment.delete(0, xmlFragment.length)
        }
        Y.applyUpdateV2(ydoc, snapshotBytes)
      }

      // 4. Perform save document mutation using restored JSON content and snapshot state
      saveDocument(
        {
          workspaceId,
          documentId,
          content: restoredContent,
          snapshot: snapshotDetail.state,
          description: "Version restored",
        },
        {
          onSuccess: () => {
            setIsConfirmOpen(false)
            onOpenChange(false)
            toast.success("Document restored successfully!")
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Failed to restore document")
          },
        }
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process snapshot for restore")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col h-full bg-background border-l border-border">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <SheetTitle className="text-sm font-semibold">Version History</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            View past snapshots of this document. Selecting a snapshot shows an isolated read-only preview.
          </SheetDescription>
        </SheetHeader>

        {/* Content Body split: Timeline List (left/top) + Preview (right/bottom) */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Timeline Sidebar */}
          <div className="w-full md:w-72 shrink-0 flex flex-col bg-card/30 overflow-y-auto p-3 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
              Snapshots ({snapshots?.length || 0})
            </span>

            {/* List Loading State */}
            {isLoadingList && (
              <div className="space-y-3 px-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 items-center p-2.5 rounded-lg border border-border/40">
                    <Skeleton className="size-8 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List Error State */}
            {listError && (
              <div className="p-3 border border-destructive/20 bg-destructive/5 rounded-lg text-left space-y-2">
                <span className="text-xs text-destructive font-medium flex items-center gap-1.5">
                  <AlertCircle className="size-3.5 shrink-0" />
                  Failed to load history.
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => refetchList()}
                  className="w-full text-xs cursor-pointer"
                >
                  Retry
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingList && !listError && (!snapshots || snapshots.length === 0) && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4 space-y-2">
                <Clock className="size-8 text-muted-foreground/50" />
                <p className="text-xs font-medium text-foreground">No snapshots yet</p>
                <p className="text-[11px] text-muted-foreground">
                  Version snapshots are automatically created when document updates are saved.
                </p>
              </div>
            )}

            {/* Timeline List */}
            {!isLoadingList && !listError && snapshots && snapshots.length > 0 && (
              <div className="relative space-y-2">
                {/* Timeline vertical line indicator */}
                <div className="absolute left-5.25 top-3 bottom-3 w-0.5 bg-border/60 z-0" />

                {snapshots.map((item) => {
                  const isSelected = item.id === selectedSnapshotId
                  const relativeTime = intlFormatDistance(new Date(item.createdAt), new Date(), {
                    style: "long",
                  })
                  const exactTime = new Date(item.createdAt).toLocaleString()

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedSnapshotId(item.id)}
                      className={`relative z-10 flex items-start gap-3 p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-primary/10 border-primary/40 shadow-xs ring-1 ring-primary/20"
                          : "bg-background/80 hover:bg-muted/60 border-border/60"
                      }`}
                    >
                      {/* Avatar / Creator representation */}
                      {item.createdBy.avatar ? (
                        <img
                          src={item.createdBy.avatar}
                          alt={item.createdBy.name}
                          className="size-7 rounded-full object-cover border border-border shrink-0 mt-0.5"
                        />
                      ) : (
                        <div
                          className={`size-7 rounded-full flex items-center justify-center font-bold text-[10px] border shrink-0 mt-0.5 select-none ${getAvatarBgColor(
                            item.createdBy.name || "User"
                          )}`}
                        >
                          {item.createdBy.name ? item.createdBy.name.charAt(0).toUpperCase() : <UserIcon className="size-3" />}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {item.createdBy.name || "Unknown"}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary text-primary-foreground shrink-0">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.description || "Saved snapshot"}
                        </p>

                        <span
                          title={exactTime}
                          className="text-[10px] text-muted-foreground/80 block font-medium"
                        >
                          {relativeTime}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Snapshot Preview Main Panel */}
          <div className="flex-1 flex flex-col min-w-0 bg-background p-4 overflow-hidden">
            {!selectedSnapshotId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                <History className="size-10 text-muted-foreground/40" />
                <p className="text-xs font-medium">Select a snapshot to preview</p>
                <p className="text-[11px] max-w-xs">
                  Choose any timestamp from the list on the left to view that version in read-only mode.
                </p>
              </div>
            ) : isLoadingDetail ? (
              <div className="flex-1 flex flex-col space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="flex-1 w-full rounded-lg" />
              </div>
            ) : detailError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
                  <span className="text-xs text-destructive font-medium flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    Failed to load snapshot details.
                  </span>
                  <Button size="xs" variant="outline" onClick={() => refetchDetail()} className="cursor-pointer">
                    Retry
                  </Button>
                </div>
              </div>
            ) : snapshotDetail ? (
              <div className="flex-1 flex flex-col min-h-0 space-y-3">
                {/* Preview Toolbar / Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border/80 shrink-0 gap-2">
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">
                        {snapshotDetail.description || "Version Snapshot"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold uppercase tracking-wider shrink-0 border border-border">
                        Read Only
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      Created by {snapshotDetail.createdBy.name} on{" "}
                      {new Date(snapshotDetail.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleRestoreClick}
                    disabled={isRestoring}
                    className="cursor-pointer shrink-0 font-medium hover:bg-muted"
                  >
                    {isRestoring ? (
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5 mr-1.5" />
                    )}
                    Restore
                  </Button>
                </div>

                {/* Isolated Tiptap Read-only Editor */}
                <div className="flex-1 min-h-0 relative">
                  <SnapshotReadOnlyEditor
                    key={snapshotDetail.id}
                    state={snapshotDetail.state}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Confirmation Dialog for Restore */}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <RotateCcw className="size-4 text-primary" />
                Restore Document Version
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
                Are you sure you want to restore this version? This will replace the current document contents with the selected snapshot version while preserving version history.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isRestoring}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="cursor-pointer"
              >
                {isRestoring && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                Restore Version
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  )
}