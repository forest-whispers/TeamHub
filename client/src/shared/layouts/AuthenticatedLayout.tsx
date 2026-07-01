import { Navigate, Outlet } from "react-router-dom"
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus"
import { Spinner } from "@/shared/components/ui/spinner"

export default function AuthenticatedLayout() {
  const { data: authStatus, isLoading } = useAuthStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!authStatus?.isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Outlet />
    </div>
  )
}