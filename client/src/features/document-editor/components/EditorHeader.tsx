import { intlFormatDistance } from "date-fns";
import { Button } from "@/shared/components/ui/button"
import { Share2, Download, CheckCircle2, AlertCircle } from "lucide-react"

interface EditorHeaderProps {
  title: string
  isDirty: boolean
  updatedAt: string
  lastEditedBy: string
}

export function EditorHeader({ title, isDirty, updatedAt, lastEditedBy }: EditorHeaderProps) {
  const editTrack = `Updated ${intlFormatDistance(
    new Date(updatedAt),
    new Date(),
    {
      style: "long",
    }
  )}`;
  return (
    <div className="flex flex-row items-center justify-between px-4 border-b border-border bg-card shrink-0 gap-4 text-left select-none h-9">
      <div className="min-w-0 flex items-center gap-2 flex-nowrap overflow-hidden">
        <span className="text-xs font-bold text-foreground truncate min-w-0">
          {title}
        </span>
        {isDirty ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider shrink-0">
            <AlertCircle className="size-3" />
            Unsaved Changes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0">
            <CheckCircle2 className="size-3" />
            Saved
          </span>
        )}
        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider hidden sm:inline-block shrink-0">
          {editTrack} by {lastEditedBy}
        </span>
      </div>

      {/* Editor Actions Placeholder */}
      <div className="flex items-center gap-1.5 shrink-0">
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