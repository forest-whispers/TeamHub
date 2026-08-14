import type { WorkspaceFile } from "../types"
import { FileCard } from "./FileCard"

interface FilesGridProps {
  files: WorkspaceFile[]
  onRename: (file: WorkspaceFile) => void
  onDelete: (file: WorkspaceFile) => void
}

export function FilesGrid({ files, onRename, onDelete }: FilesGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} onRename={onRename} onDelete={onDelete} />
      ))}
    </div>
  )
}