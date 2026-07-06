import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useWorkspaceDocuments, useUpdateDocument, useDeleteDocument } from "../hooks/useWorkspaceDocuments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { CreateDocumentDialog } from "../components/CreateDocumentDialog"
import { RenameDocumentDialog } from "../components/RenameDocumentDialog"
import { DeleteDocumentDialog } from "../components/DeleteDocumentDialog"
import { useDocumentTabs } from "@/features/document-editor/context/DocumentTabsContext"
import { toast } from "sonner"
import { socket } from "../../../shared/lib/socket.ts";
import type { UpdateDocumentData, WorkspaceDocument } from "../types"
import {
  Search,
  Plus,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react"
import { SelectDropdown } from "@/shared/components/ui/SelectDropdown"

type SortOption = "updatedAt" | "title" | "createdAt"

export default function WorkspaceDocuments() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()

  // States
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt")
  const [createOpen, setCreateOpen] = useState(false)
  const [UpdatingDocument, setUpdatingDocument] = useState<WorkspaceDocument | null>(null)
  const [deletingDocument, setDeletingDocument] = useState<WorkspaceDocument | null>(null)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null)

  // Context & Hooks
  const { updateTabName, closeTab, openTab } = useDocumentTabs()

  // Queries & Mutations
  const {
    data: documents,
    isLoading,
    error,
    refetch,
  } = useWorkspaceDocuments(workspaceId || "")

  const { mutate: updateDocument, isPending: isUpdating } = useUpdateDocument(workspaceId || "")
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument(workspaceId || "")

  const handleUpdateSubmit = (data: UpdateDocumentData) => {
    if (!UpdatingDocument) return
    updateDocument(
      { documentId: UpdatingDocument.id, data },
      {
        onSuccess: (updatedDoc) => {
          updateTabName(UpdatingDocument.id, updatedDoc.title)
          toast.success("Document renamed successfully")
          setUpdatingDocument(null)
          setDialogError(null)
        },
        onError: (err: any) => {
          setDialogError(err.message || "Failed to rename document.")
        },
      }
    )
  }

  const handleDeleteSubmit = () => {
    if (!deletingDocument) return
    deleteDocument(deletingDocument.id, {
      onSuccess: () => {
        closeTab(deletingDocument.id)
        toast.success("Document deleted successfully")
        setDeletingDocument(null)
        setDeleteDialogError(null)
      },
      onError: (err: any) => {
        setDeleteDialogError(err.message || "Failed to delete document.")
      },
    })
  }

  const openDocument = (doc: any) => {
    openTab(doc.id, doc.title, workspaceId || "", doc.icon)
    console.log("document:join")
    socket.emit("document:join", {
      workspaceId,
      documentId: doc.id,
    },
      (response: {
        success: boolean;
        data?: { documentId: string };
        message?: string;
      }) => {
        if (!response.success) {
          console.error(response.message);
          return;
        }

        console.log(response.data);
      });
    navigate(`/workspace/${workspaceId}/documents/${doc.id}`)
  }

  // Search filtering
  const filteredDocs =
    documents?.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  // Client-side sorting
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title)
    } else if (sortBy === "createdAt") {
      return b.title.localeCompare(a.title)
    } else {
      // Default: Last Edited. In mock data, doc-1 is newest, doc-3 is oldest.
      // We can sort by document ID to maintain the logical order of mock documents.
      return a.id.localeCompare(b.id)
    }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-left">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 select-none">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Documents</h1>
          <p className="text-muted-foreground text-xs">
            Browse and manage files in this workspace.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="cursor-pointer">
          <Plus className="size-4 mr-1.5" />
          Create Document
        </Button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 select-none">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
            disabled={isLoading || !!error}
          />
        </div>

        {/* Sort Selector */}
        <SelectDropdown
          value={sortBy}
          onChange={(val) => setSortBy(val as SortOption)}
          options={[
            { value: "lastEdited", label: "Last Edited" },
            { value: "name", label: "Name (A-Z)" },
            { value: "createdAt", label: "Created At" },
          ]}
          icon={<ArrowUpDown className="size-3.5" />}
        />
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border">
              <CardHeader className="pb-3 text-left">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="h-10 pt-2 border-t border-border/50 flex justify-between items-center">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-3.5 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error Feedback State */}
      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center justify-between gap-4 text-left">
          <span className="text-sm text-destructive font-medium flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            Failed to load documents.
          </span>
          <Button size="xs" variant="outline" onClick={() => refetch()} className="cursor-pointer">
            Retry
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && sortedDocs.length === 0 && (
        <div className="p-12 border border-dashed border-border rounded-xl text-center select-none space-y-3">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-base text-foreground">No documents found</h3>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto">
            {searchQuery
              ? "We couldn't find any documents matching your search term. Try adjusting your query."
              : "This workspace doesn't have any documents yet. Create your first one above!"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setCreateOpen(true)} size="sm" variant="outline" className="cursor-pointer mt-2">
              <Plus className="size-4 mr-1.5" />
              Create First Document
            </Button>
          )}
        </div>
      )}

      {/* Documents Grid List */}
      {!isLoading && !error && sortedDocs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDocs.map((doc) => (
            <Card
              key={doc.id}
              tabIndex={0}
              onClick={() => openDocument(doc)}
              onKeyDown={(e) => {
                // Navigate on Enter or Space, but NOT if the focus is on the Rename button itself!
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault()
                  openDocument(doc)
                }
              }}
              className="border border-border hover:border-border/80 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none transition-all cursor-pointer flex flex-col justify-between group"
            >
              <CardHeader className="pb-3 text-left">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base font-bold group-hover:text-primary transition-colors flex items-center gap-2 truncate flex-1 min-w-0">
                    {doc.icon ? (
                      <span className="text-base leading-none">
                        {doc.icon}
                      </span>
                    ) : (
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{doc.title}</span>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity ml-0">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-[11px] h-6 px-2 cursor-pointer border border-transparent hover:border-border"
                    onClick={(e) => {
                      e.stopPropagation()
                      setUpdatingDocument(doc)
                      setDialogError(null)
                    }}
                  >
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-[11px] h-6 px-2 cursor-pointer border border-transparent hover:border-destructive hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingDocument(doc)
                      setDeleteDialogError(null)
                    }}
                  >
                    Delete
                  </Button>
                </div>
                <CardDescription className="text-xs truncate">
                  Edited by {doc.createdBy.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-[10px] text-muted-foreground border-t border-border/50 pt-3 flex justify-between items-center select-none uppercase font-semibold tracking-wider">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {doc.updatedAt}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" /> {doc.createdAt || doc.updatedAt}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Placeholder dialog */}
      <CreateDocumentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId || ""}
        onSuccess={(doc) => {
          navigate(`/workspace/${workspaceId}/documents/${doc.id}`)
        }}
      />

      {/* Rename dialog */}
      <RenameDocumentDialog
        open={UpdatingDocument !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUpdatingDocument(null)
            setDialogError(null)
          }
        }}
        currentTitle={UpdatingDocument?.title || ""}
        onUpdate={handleUpdateSubmit}
        isPending={isUpdating}
        errorMsg={dialogError}
      />

      {/* Delete dialog */}
      <DeleteDocumentDialog
        open={deletingDocument !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingDocument(null)
            setDeleteDialogError(null)
          }
        }}
        documentName={deletingDocument?.title || ""}
        onConfirm={handleDeleteSubmit}
        isPending={isDeleting}
        errorMsg={deleteDialogError}
      />
    </div>
  )
}