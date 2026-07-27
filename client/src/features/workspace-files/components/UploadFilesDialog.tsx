import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { useUploadFile } from "../hooks/useWorkspaceFiles"
import { toast } from "sonner"
import { Upload, File, X, Loader2 } from "lucide-react"
import { getErrorMessage } from "@/shared/lib/getErrorMessage"

interface UploadFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
}

export function UploadFilesDialog({ open, onOpenChange, workspaceId }: UploadFilesDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { mutate: uploadFile, isPending } = useUploadFile(workspaceId)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return
    uploadFile(file, {
      onSuccess: () => {
        toast.success("File uploaded successfully")
        setFile(null)
        onOpenChange(false)
      },
      onError: (err: any) => {
        toast.error(getErrorMessage(err))
      },
    })
  }

  const handleClear = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isPending) {
        onOpenChange(val)
        if (!val) setFile(null)
      }
    }}>
      <DialogContent className="sm:max-w-md text-left">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription className="text-xs pt-1">
            Drag and drop a file or click to browse.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isPending}
            className="hidden"
            id="file-upload-input"
          />

          {!file ? (
            <label
              htmlFor="file-upload-input"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 min-h-40 ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/80 hover:bg-card/20"
              }`}
            >
              <Upload className="size-8 text-muted-foreground mb-2" />
              <span className="text-xs font-semibold text-foreground">Click to select file</span>
              <span className="text-[10px] text-muted-foreground mt-1">or drag and drop here</span>
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/25">
              <div className="flex items-center gap-2.5 min-w-0">
                <File className="size-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={handleClear}
                className="size-7 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => {
              setFile(null)
              onOpenChange(false)
            }}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!file || isPending}
            onClick={handleUpload}
            className="cursor-pointer min-w-17.5 flex items-center justify-center"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin shrink-0 mr-1.5" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}