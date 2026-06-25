import { Card, CardContent } from "@/shared/components/ui/card"
import { FileText, FileImage, FileSpreadsheet, FileArchive, FileVideo, File, User, Calendar } from "lucide-react"
import type { WorkspaceFile } from "../types"

interface FileCardProps {
  file: WorkspaceFile
}

const getFileIcon = (type: WorkspaceFile["type"]) => {
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

const getIconBg = (type: WorkspaceFile["type"]) => {
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

export function FileCard({ file }: FileCardProps) {
  return (
    <Card className="border border-border bg-card/45 hover:bg-card hover:shadow-sm transition-all duration-200 text-left overflow-hidden select-none">
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`size-10 rounded-lg flex items-center justify-center border shrink-0 ${getIconBg(file.type)}`}>
          {getFileIcon(file.type)}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="font-semibold text-sm text-foreground truncate leading-tight" title={file.name}>
            {file.name}
          </div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 leading-none">
            <span>{file.size}</span>
            <span>•</span>
            <span className="truncate flex items-center gap-0.5">
              <User className="size-3 text-muted-foreground/75" />
              {file.uploadedBy}
            </span>
          </div>
          <div className="pt-1 flex items-center gap-1 text-[10px] text-muted-foreground/80 select-none">
            <Calendar className="size-3 text-muted-foreground/60" />
            <span>{file.uploadedAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
