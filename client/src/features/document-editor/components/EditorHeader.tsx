import { useState } from "react"
import { intlFormatDistance } from "date-fns"
import { Button } from "@/shared/components/ui/button"
import { Share2, Download, CheckCircle2, AlertCircle, Save, Loader2, History } from "lucide-react"

interface EditorHeaderProps {
  title: string
  icon?: string | null
  isDirty: boolean
  updatedAt: string
  lastEditedBy: string
  onSave?: () => void
  isSaving?: boolean
  onRename?: (newTitle: string) => Promise<void>
  isRenaming?: boolean
  onOpenVersionHistory?: () => void
}

export function EditorHeader({
  title,
  icon,
  isDirty,
  updatedAt,
  lastEditedBy,
  onSave,
  isSaving,
  onRename,
  isRenaming,
  onOpenVersionHistory,
}: EditorHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempTitle, setTempTitle] = useState(title)

  const editTrack = `Updated ${intlFormatDistance(
    new Date(updatedAt),
    new Date(),
    {
      style: "long",
    }
  )}`

  const handleStartEdit = () => {
    setTempTitle(title)
    setIsEditing(true)
  }

  const handleFinishEditing = () => {
    setIsEditing(false)
    const trimmed = tempTitle.trim()
    if (trimmed && trimmed !== title && onRename) {
      onRename(trimmed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleFinishEditing()
    } else if (e.key === "Escape") {
      setTempTitle(title)
      setIsEditing(false)
    }
  }

  return (
    <div className="flex flex-row items-center justify-between px-4 border-b border-border bg-card shrink-0 gap-4 text-left select-none h-8">
      <div className="min-w-0 flex items-center gap-2 flex-nowrap overflow-hidden">
        {isEditing ? (
          <div className="flex items-center gap-1.5 min-w-0">
            {icon && <span className="text-sm select-none shrink-0">{icon}</span>}
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isRenaming}
              className="text-xs font-bold text-foreground bg-transparent border-b border-primary outline-none py-0.5 px-0.5 max-w-50 sm:max-w-xs focus:ring-0 focus:ring-offset-0 focus:outline-none"
            />
          </div>
        ) : (
          <div
            onClick={!isRenaming ? handleStartEdit : undefined}
            className={`flex items-center gap-1.5 min-w-0 rounded px-1 -mx-1 transition-all ${
              !isRenaming ? "hover:bg-muted/50 cursor-pointer" : "opacity-75"
            }`}
          >
            {icon && <span className="text-sm select-none shrink-0">{icon}</span>}
            <span className="text-xs font-bold text-foreground truncate min-w-0">
              {title}
            </span>
          </div>
        )}

        {isRenaming && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground border border-border uppercase tracking-wider shrink-0">
            <Loader2 className="size-3 animate-spin shrink-0" />
            Renaming...
          </span>
        )}

        {!isRenaming && (
          isSaving ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider shrink-0">
              <Loader2 className="size-3 animate-spin shrink-0" />
              Saving...
            </span>
          ) : isDirty ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider shrink-0">
              <AlertCircle className="size-3 shrink-0" />
              Unsaved Changes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0">
              <CheckCircle2 className="size-3 shrink-0" />
              Saved
            </span>
          )
        )}

        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider hidden sm:inline-block shrink-0">
          {editTrack} by {lastEditedBy}
        </span>
      </div>

      {/* Editor Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenVersionHistory && (
          <Button
            variant="outline"
            size="xs"
            onClick={onOpenVersionHistory}
            className="cursor-pointer h-6 font-normal text-muted-foreground hover:text-foreground text-xs"
            title="View document version history"
          >
            <History className="size-3" />
            Version History
          </Button>
        )}
        {onSave && (
          <Button
            variant="ghost"
            size="xs"
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="cursor-pointer h-6 font-semibold text-muted-foreground hover:text-foreground text-xs"
          >
            {isSaving ? (
              <Loader2 className="size-3 animate-spin mr-1.5 shrink-0" />
            ) : (
              <Save className="size-3 mr-1.5 shrink-0" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        )}
        <Button variant="outline" size="xs" className="cursor-pointer h-6">
          <Share2 className="size-3" />
          Share
        </Button>
        <Button variant="outline" size="xs" className="cursor-pointer h-6">
          <Download className="size-3" />
          Export
        </Button>
      </div>
    </div>
  )
}