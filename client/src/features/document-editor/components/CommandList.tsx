import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react"
import { Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Code, Minus, Grid } from "lucide-react"
import type { CommandItem } from "../extensions/SlashCommand"

interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Grid,
}

export const CommandList = forwardRef(({ items, command }: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
        return true
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length)
        return true
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex)
        return true
      }

      return false
    },
  }))

  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" })
      }
    }
  }, [selectedIndex])

  if (items.length === 0) {
    return (
      <div className="bg-popover text-muted-foreground border border-border shadow-md rounded-md py-2 px-3 text-xs min-w-60">
        No results found
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="max-h-72 overflow-y-auto bg-popover text-popover-foreground border border-border shadow-md rounded-md p-1 min-w-65 flex flex-col gap-0.5 select-none"
    >
      {items.map((item, index) => {
        const IconComponent = iconMap[item.icon]
        const isSelected = index === selectedIndex

        return (
          <button
            key={item.title}
            type="button"
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer outline-none focus:outline-none ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <div
              className={`size-6 shrink-0 rounded flex items-center justify-center border ${
                isSelected
                  ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {IconComponent && <IconComponent className="size-3.5" />}
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-[11px] font-bold leading-tight">{item.title}</span>
              <span
                className={`text-[9px] truncate leading-tight ${
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
})

CommandList.displayName = "CommandList"