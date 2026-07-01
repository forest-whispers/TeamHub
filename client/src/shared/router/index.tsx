import { lazy } from "react"
import { createBrowserRouter, Navigate } from "react-router-dom"
import RootLayout from "@/shared/layouts/RootLayout"
import PublicLayout from "@/shared/layouts/PublicLayout"
import AuthenticatedLayout from "@/shared/layouts/AuthenticatedLayout"
import WorkspaceLayout from "@/shared/layouts/WorkspaceLayout"
import GuestLayout from "@/shared/layouts/GuestLayout"

const LandingPage = lazy(() => import("@/features/landing/pages/LandingPage"))
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"))
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"))
const WorkspaceHome = lazy(() => import("@/features/workspace-home/pages/WorkspaceHome"))
const WorkspaceDocuments = lazy(() => import("@/features/workspace-documents/pages/WorkspaceDocuments"))
const WorkspaceDocumentEditor = lazy(() => import("@/features/document-editor/pages/WorkspaceDocumentEditor"))
const WorkspaceActivity = lazy(() => import("@/features/workspace-activity/pages/WorkspaceActivity"))
const WorkspaceFiles = lazy(() => import("@/features/workspace-files/pages/WorkspaceFiles"))
const WorkspaceAnalytics = lazy(() => import("@/features/workspace-analytics/pages/WorkspaceAnalytics"))
const WorkspaceSettings = lazy(() => import("@/features/workspace-settings/pages/WorkspaceSettings"))
const WorkspaceMembers = lazy(() => import("@/features/workspace-members/pages/WorkspaceMembers"))
const WorkspaceChat = lazy(() => import("@/features/workspace-chat/pages/WorkspaceChat"))

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: "/",
            element: <LandingPage />,
          },
          {
            element: <GuestLayout />,
            children: [
              {
                path: "/login",
                element: <LoginPage />,
              },
              {
                path: "/register",
                element: <RegisterPage />,
              },
            ],
          },
        ],
      },
      {
        element: <AuthenticatedLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/workspace/:workspaceId",
            element: <WorkspaceLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="home" replace />,
              },
              {
                path: "home",
                element: <WorkspaceHome />,
              },
              {
                path: "documents",
                element: <WorkspaceDocuments />,
              },
              {
                path: "documents/:documentId",
                element: <WorkspaceDocumentEditor />,
              },
              {
                path: "members",
                element: <WorkspaceMembers />,
              },
              {
                path: "activity",
                element: <WorkspaceActivity />,
              },
              {
                path: "files",
                element: <WorkspaceFiles />,
              },
              {
                path: "analytics",
                element: <WorkspaceAnalytics />,
              },
              {
                path: "chat",
                element: <WorkspaceChat />,
              },
              {
                path: "settings",
                element: <WorkspaceSettings />,
              },
            ],
          },
        ],
      },
    ],
  },
])