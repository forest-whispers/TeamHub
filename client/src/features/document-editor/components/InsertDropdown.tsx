import { useState, useRef, useEffect } from "react"
import { Plus, Grid, Minus } from "lucide-react"

interface InsertDropdownProps {
  editor: any
  disabled?: boolean
}

export function InsertDropdown({ editor, disabled }: InsertDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    setIsOpen(false)
  }

  const handleInsertDivider = () => {
    editor.chain().focus().setHorizontalRule().run()
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="h-7 px-2 flex items-center justify-center gap-1 text-[11px] font-semibold rounded-md border border-border text-foreground hover:bg-muted/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Insert blocks"
      >
        <Plus className="size-3 shrink-0" />
        <span>Insert</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 min-w-40 rounded-md border border-border bg-popover text-popover-foreground p-1 shadow-md flex flex-col gap-0.5 select-none">
          <button
            type="button"
            onClick={handleInsertTable}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-muted text-foreground cursor-pointer outline-none"
          >
            <Grid className="size-3.5 text-muted-foreground shrink-0" />
            <span>Table (3x3)</span>
          </button>
          <button
            type="button"
            onClick={handleInsertDivider}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-muted text-foreground cursor-pointer outline-none"
          >
            <Minus className="size-3.5 text-muted-foreground shrink-0" />
            <span>Divider</span>
          </button>
        </div>
      )}
    </div>
  )
}