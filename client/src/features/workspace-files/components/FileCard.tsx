import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { FileText, FileImage, FileSpreadsheet, FileArchive, FileVideo, File, User, Calendar } from "lucide-react"
import { format } from "date-fns"
import type { WorkspaceFile } from "../types"

interface FileCardProps {
  file: WorkspaceFile
  onRename: (file: WorkspaceFile) => void
  onDelete: (file: WorkspaceFile) => void
}

type FileCategory = "document" | "image" | "spreadsheet" | "archive" | "media"

const getFileCategory = (mimeType: string, extension: string | null): FileCategory => {
  const mime = mimeType.toLowerCase()
  const ext = extension?.toLowerCase() || ""

  if (mime.startsWith("image/")) {
    return "image"
  }
  if (mime.startsWith("video/") || mime.startsWith("audio/")) {
    return "media"
  }
  if (
    mime === "text/csv" ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    ext === "csv" ||
    ext === "xls" ||
    ext === "xlsx" ||
    ext === "ods"
  ) {
    return "spreadsheet"
  }
  if (
    mime === "application/zip" ||
    mime === "application/x-zip-compressed" ||
    mime === "application/x-tar" ||
    mime === "application/x-rar-compressed" ||
    mime === "application/x-7z-compressed" ||
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar" ||
    ext === "gz"
  ) {
    return "archive"
  }
  return "document"
}

const getFileIcon = (type: FileCategory) => {
  switch (type) {
    case "document":
      return <FileText className="size-5 text-blue-500" />
    case "image":
      return <FileImage className="size-5 text-emerald-500" />
    case "spreadsheet":
      return <FileSpreadsheet className="size-5 text-green-500" />
    case "archive":
      return <FileArchive className="size-5 text-amber-500" />
    case "media":
      return <FileVideo className="size-5 text-violet-500" />
    default:
      return <File className="size-5 text-muted-foreground" />
  }
}

const getIconBg = (type: FileCategory) => {
  switch (type) {
    case "document":
      return "bg-blue-500/10 border-blue-500/20"
    case "image":
      return "bg-emerald-500/10 border-emerald-500/20"
    case "spreadsheet":
      return "bg-green-500/10 border-green-500/20"
    case "archive":
      return "bg-amber-500/10 border-amber-500/20"
    case "media":
      return "bg-violet-500/10 border-violet-500/20"
    default:
      return "bg-muted/10 border-muted/20"
  }
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export function FileCard({ file, onRename, onDelete }: FileCardProps) {
  const category = getFileCategory(file.mimeType, file.extension)
  
  const handleOpen = () => {
    window.open(file.url, "_blank", "noopener,noreferrer")
  }

  return (
    <Card 
      onClick={handleOpen}
      className="border border-border bg-card/45 hover:bg-card hover:shadow-sm transition-all duration-200 text-left overflow-hidden select-none cursor-pointer group flex flex-col justify-between"
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center border shrink-0 ${getIconBg(category)}`}>
          {getFileIcon(category)}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div 
              className="font-semibold text-sm text-foreground truncate leading-tight flex-1" 
              title={file.displayName}
            >
              {file.displayName}
            </div>
            
            {/* Actions visible on hover */}
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="xs"
                className="text-[10px] h-5 px-1.5 cursor-pointer border border-transparent hover:border-border"
                onClick={(e) => {
                  e.stopPropagation()
                  onRename(file)
                }}
              >
                Rename
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="text-[10px] h-5 px-1.5 cursor-pointer border border-transparent hover:border-destructive hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(file)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
          
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 leading-none">
            <span>{formatBytes(file.size)}</span>
            <span>•</span>
            <span className="truncate flex items-center gap-0.5" title={file.uploadedBy.name}>
              <User className="size-3 text-muted-foreground/75" />
              {file.uploadedBy.name}
            </span>
          </div>
          <div className="pt-1 flex items-center gap-1 text-[10px] text-muted-foreground/80 select-none">
            <Calendar className="size-3 text-muted-foreground/60" />
            <span>{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}