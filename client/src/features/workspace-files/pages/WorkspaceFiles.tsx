import { useState, useMemo } from "react"
import { useParams } from "react-router-dom"
import { useWorkspaceFiles } from "../hooks/useWorkspaceFiles"
import { UploadFilesDialog } from "../components/UploadFilesDialog"
import { FilesGrid } from "../components/FilesGrid"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"
import { Search, Filter, Upload, FolderOpen, HelpCircle, AlertCircle } from "lucide-react"

export default function WorkspaceFiles() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [uploadOpen, setUploadOpen] = useState(false)

  const {
    data: files,
    isLoading,
    error,
    refetch,
  } = useWorkspaceFiles(workspaceId || "")

  // Client-side search and filtering logic
  const filteredFiles = useMemo(() => {
    if (!files) return []
    return files.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter === "all" || file.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [files, searchQuery, typeFilter])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-left select-none">
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
      {!isLoading && !error && files && (
        <>
          {filteredFiles.length === 0 ? (
            /* Empty State layouts */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-xl bg-card/25 min-h-75">
              {files.length === 0 ? (
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
            <FilesGrid files={filteredFiles} />
          )}
        </>
      )}

      {/* Upload Files overlay Dialog container */}
      <UploadFilesDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  )
}