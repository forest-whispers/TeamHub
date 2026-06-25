import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      data-slot="spinner"
      className={cn("animate-spin text-primary", className)}
      {...props}
    />
  )
}

export { Spinner }
