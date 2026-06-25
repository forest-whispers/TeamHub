import type { ReactNode } from "react"
import { Label } from "@/shared/components/ui/label"

interface SettingsFieldProps {
  label: string
  description?: string
  children: ReactNode
}

export function SettingsField({ label, description, children }: SettingsFieldProps) {
  return (
    <div className="space-y-1.5 text-left">
      <div className="space-y-0.5">
        <Label className="text-xs font-semibold text-foreground">
          {label}
        </Label>
        {description && (
          <p className="text-[10px] text-muted-foreground leading-normal">
            {description}
          </p>
        )}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
