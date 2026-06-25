import { Outlet, Link, useLocation } from "react-router-dom"
import { useTheme } from "../providers/ThemeProvider"
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus"
import { Sun, Moon, Laptop } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export default function PublicLayout() {
  const { theme, setTheme } = useTheme()
  const { data: authStatus, isLoading } = useAuthStatus()
  const location = useLocation()

  const toggleThemeCycle = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="size-4 text-amber-500" />
      case "dark":
        return <Moon className="size-4 text-indigo-400" />
      default:
        return <Laptop className="size-4 text-muted-foreground" />
    }
  }

  const getThemeTitle = () => {
    switch (theme) {
      case "light":
        return "Theme: Light (Click to cycle to Dark)"
      case "dark":
        return "Theme: Dark (Click to cycle to System)"
      default:
        return "Theme: System (Click to cycle to Light)"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Unified combined Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm select-none shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              T
            </div>
            <span className="font-bold text-lg tracking-tight">TeamHub</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Single cycle theme button */}
            <button
              onClick={toggleThemeCycle}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
              title={getThemeTitle()}
            >
              {getThemeIcon()}
            </button>

            {/* Auth navigation links */}
            <nav className="flex items-center gap-2.5">
              {isLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
              ) : authStatus?.isAuthenticated ? (
                <>
                  <Button asChild size="sm" variant="outline" className="cursor-pointer">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button
                    onClick={() => {
                      localStorage.removeItem("teamhub-mock-authenticated")
                      window.location.reload()
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  {location.pathname !== "/login" && (
                    <Button asChild size="sm" variant="ghost" className="cursor-pointer">
                      <Link to="/login">Login</Link>
                    </Button>
                  )}
                  {location.pathname !== "/register" && (
                    <Button asChild size="sm" variant="default" className="cursor-pointer">
                      <Link to="/register">Get Started</Link>
                    </Button>
                  )}
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

