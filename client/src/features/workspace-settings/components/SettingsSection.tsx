import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"

interface SettingsSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <Card className="border border-border bg-card/45 select-none text-left">
      <CardHeader className="p-4 pb-2 border-b border-border/40">
        <CardTitle className="text-sm font-bold text-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}
