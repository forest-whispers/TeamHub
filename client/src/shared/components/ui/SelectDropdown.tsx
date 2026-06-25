import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface SelectDropdownProps {
  value: string
  onChange: (val: string) => void
  options: Option[]
  icon?: React.ReactNode
  className?: string
  align?: "left" | "right"
}

export function SelectDropdown({
  value,
  onChange,
  options,
  icon,
  className = "w-full sm:w-48",
  align = "left",
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative select-none text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer hover:bg-muted/40 transition-all duration-200"
      >
        <span className="absolute left-3 top-2.5 size-3.5 flex items-center justify-center text-muted-foreground">
          {icon}
        </span>
        <span className="truncate pr-1 font-medium">{selectedOption?.label}</span>
        <ChevronDown
          className="size-3.5 text-muted-foreground shrink-0 ml-1 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>

      {/* Floating Options Menu */}
      {isOpen && (
        <div
          className={`absolute top-[calc(100%+4px)] ${
            align === "right" ? "right-0" : "left-0"
          } z-50 min-w-[12rem] w-full overflow-hidden rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg animate-in fade-in-50 slide-in-from-top-1 duration-150`}
        >
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-all duration-150 text-left cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-accent hover:text-accent-foreground text-foreground"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="size-3.5 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
