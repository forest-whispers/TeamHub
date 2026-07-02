import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useDocumentDetail } from "../hooks/useDocumentDetail"
import { useDocumentTabs } from "../context/DocumentTabsContext"
import { EditorTabs } from "../components/EditorTabs"
import { TiptapEditor } from "../components/TiptapEditor"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { AlertCircle, FileQuestion } from "lucide-react"

export default function WorkspaceDocumentEditor() {
  const { workspaceId, documentId } = useParams<{ workspaceId: string; documentId: string }>()
  const { openTab } = useDocumentTabs()

  const {
    data: documentDetail,
    isLoading,
    error,
    refetch,
  } = useDocumentDetail(workspaceId || "", documentId || "")

  // Register open tab metadata once document is successfully resolved
  useEffect(() => {
    if (documentDetail) {
      openTab(documentDetail.id, documentDetail.name, documentDetail.workspaceId)
    }
  }, [documentDetail, openTab])

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* IDE/Browser Tab list */}
      <EditorTabs />

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="flex-1 flex flex-col p-6 space-y-4">
          <div className="space-y-2 text-left">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="border-t border-border/50 pt-4 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
            <span className="text-sm text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              Failed to load document content.
            </span>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Empty / Not Found state */}
      {!isLoading && !error && !documentDetail && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
          <FileQuestion className="size-12 text-muted-foreground mb-3" />
          <h2 className="text-lg font-semibold text-foreground">Document not found</h2>
          <p className="text-muted-foreground text-sm max-w-xs mt-1">
            We couldn't find the requested document in this workspace. It may have been moved or deleted.
          </p>
        </div>
      )}

      {/* Query-gated Editor Instance */}
      {!isLoading && !error && documentDetail && (
        <TiptapEditor key={documentDetail.id} documentData={documentDetail} />
      )}
    </div>
  )
}