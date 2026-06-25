import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import { CommandPaletteProvider } from "../providers/CommandPaletteProvider"
import { Spinner } from "@/shared/components/ui/spinner"

export default function RootLayout() {
  return (
    <CommandPaletteProvider>
      <Suspense
        fallback={
          <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">
            <Spinner className="size-8" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
    </CommandPaletteProvider>
  )
}
