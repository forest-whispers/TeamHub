import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useWorkspaceFiles, useRenameFile, useDeleteFile } from "../hooks/useWorkspaceFiles"
import { UploadFilesDialog } from "../components/UploadFilesDialog"
import { RenameFileDialog } from "../components/RenameFileDialog"
import { FilesGrid } from "../components/FilesGrid"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import { Search, Filter, Upload, FolderOpen, HelpCircle, AlertCircle } from "lucide-react"
import { useDebounce } from "@/features/global-search/hooks/useGlobalSearch"
import { toast } from "sonner"
import { getErrorMessage } from "@/shared/lib/getErrorMessage"
import type { WorkspaceFile } from "../types"

export default function WorkspaceFiles() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [uploadOpen, setUploadOpen] = useState(false)
  
  const [updatingFile, setUpdatingFile] = useState<WorkspaceFile | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Map category filter to mimeType query parameter
  const mappedMimeType = useMemo(() => {
    if (typeFilter === "all") return undefined
    if (typeFilter === "image") return "image/*"
    if (typeFilter === "document") return "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if (typeFilter === "spreadsheet") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
    if (typeFilter === "archive") return "application/zip,application/x-rar-compressed"
    if (typeFilter === "media") return "video/*,audio/*"
    return undefined
  }, [typeFilter])

  const {
    data,
    isLoading,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWorkspaceFiles(workspaceId || "", {
    search: debouncedSearchQuery || undefined,
    mimeType: mappedMimeType,
  })

  const { mutate: renameFile, isPending: isRenaming } = useRenameFile(workspaceId || "")
  const { mutate: deleteFile } = useDeleteFile(workspaceId || "")

  const files = useMemo(() => data?.pages.flatMap((page) => page.files) || [], [data])

  const handleRenameSubmit = (displayName: string) => {
    if (!updatingFile) return
    renameFile(
      { fileId: updatingFile.id, displayName },
      {
        onSuccess: () => {
          toast.success("File renamed successfully")
          setUpdatingFile(null)
          setDialogError(null)
        },
        onError: (err: any) => {
          setDialogError(getErrorMessage(err))
        },
      }
    )
  }

  const handleDeleteSubmit = (file: WorkspaceFile) => {
    deleteFile(file.id, {
      onSuccess: () => {
        toast.success("File deleted successfully")
      },
      onError: (err: any) => {
        toast.error(getErrorMessage(err))
      },
    })
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 text-left select-none">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Files</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and view collaborative files in the workspace
          </p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          size="sm"
          className="cursor-pointer gap-1.5 shrink-0 self-start sm:self-center"
        >
          <Upload className="size-4" />
          Upload Files
        </Button>
      </div>

      {/* Search and Filters Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input wrapper */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* File Type Filter dropdown */}
        <SelectDropdown
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All Types" },
            { value: "document", label: "Documents" },
            { value: "image", label: "Images" },
            { value: "spreadsheet", label: "Spreadsheets" },
            { value: "archive", label: "Archives" },
            { value: "media", label: "Media" },
          ]}
          icon={<Filter className="size-3.5" />}
        />
      </div>

      {/* Loading Skeleton block */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="border border-border/50 bg-card/45">
              <CardContent className="p-4 flex items-start gap-3">
                <Skeleton className="size-10 rounded-lg shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fetching Error State view */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 max-w-md w-full text-left">
            <span className="text-sm text-destructive font-medium flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              Failed to load workspace files.
            </span>
            <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loaded Content grid */}
      {!isLoading && !error && (
        <>
          {files.length === 0 ? (
            /* Empty State layouts */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-xl bg-card/25 min-h-75">
              {!searchQuery && typeFilter === "all" ? (
                /* No files in workspace empty state */
                <>
                  <FolderOpen className="size-12 text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No files uploaded yet</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    This workspace does not contain any collaborative files yet. Upload a file to get started.
                  </p>
                  <Button
                    onClick={() => setUploadOpen(true)}
                    size="xs"
                    variant="outline"
                    className="mt-4 cursor-pointer"
                  >
                    Upload First File
                  </Button>
                </>
              ) : (
                /* Filter matched 0 files empty state */
                <>
                  <HelpCircle className="size-12 text-muted-foreground/60 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">No matches found</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mt-1 leading-relaxed">
                    Your search query or file type filter didn't match any files in this workspace. Try adjusting your settings.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("")
                      setTypeFilter("all")
                    }}
                    size="xs"
                    variant="outline"
                    className="mt-4 cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          ) : (
            /* Files Grid list layout */
            <div className="space-y-4">
              <FilesGrid 
                files={files} 
                onRename={setUpdatingFile} 
                onDelete={handleDeleteSubmit} 
              />
              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="cursor-pointer"
                  >
                    {isFetchingNextPage ? "Loading more..." : "Load More"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Upload Files overlay Dialog container */}
      <UploadFilesDialog 
        open={uploadOpen} 
        onOpenChange={setUploadOpen} 
        workspaceId={workspaceId || ""}
      />

      {/* Rename dialog */}
      <RenameFileDialog
        open={updatingFile !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUpdatingFile(null)
            setDialogError(null)
          }
        }}
        currentName={updatingFile?.displayName || ""}
        onUpdate={handleRenameSubmit}
        isPending={isRenaming}
        errorMsg={dialogError}
      />
    </div>
  )
}