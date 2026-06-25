import type { WorkspaceFile } from "../types"

const LATENCY = 500

const MOCK_FILES: Record<string, WorkspaceFile[]> = {
  "ws-1": [
    {
      id: "file-1",
      name: "API_Architecture_Guidelines.pdf",
      size: "2.4 MB",
      type: "document",
      uploadedBy: "Alex Developer",
      uploadedAt: "2 hours ago",
    },
    {
      id: "file-2",
      name: "Database_Schema_Draft_v2.xlsx",
      size: "1.8 MB",
      type: "spreadsheet",
      uploadedBy: "Jamie Product",
      uploadedAt: "4 hours ago",
    },
    {
      id: "file-3",
      name: "landing_page_mockup.png",
      size: "4.2 MB",
      type: "image",
      uploadedBy: "Morgan Designer",
      uploadedAt: "1 day ago",
    },
    {
      id: "file-4",
      name: "Client_Feedback_Summary.docx",
      size: "820 KB",
      type: "document",
      uploadedBy: "Taylor Support",
      uploadedAt: "2 days ago",
    },
    {
      id: "file-5",
      name: "Vite_Build_Artifacts.zip",
      size: "15.4 MB",
      type: "archive",
      uploadedBy: "Sam Server",
      uploadedAt: "3 days ago",
    },
    {
      id: "file-6",
      name: "Product_Launch_Demo.mp4",
      size: "48.2 MB",
      type: "media",
      uploadedBy: "Jamie Product",
      uploadedAt: "4 days ago",
    },
    {
      id: "file-7",
      name: "Release_Checklist_v1.2.txt",
      size: "12 KB",
      type: "document",
      uploadedBy: "Quinn Tester",
      uploadedAt: "5 days ago",
    },
  ],
  "ws-2": [
    {
      id: "file-101",
      name: "Marketing_Campaign_Plan.pdf",
      size: "1.5 MB",
      type: "document",
      uploadedBy: "Jamie Product",
      uploadedAt: "1 day ago",
    },
    {
      id: "file-102",
      name: "User_Persona_Research.docx",
      size: "3.2 MB",
      type: "document",
      uploadedBy: "Morgan Designer",
      uploadedAt: "3 days ago",
    },
    {
      id: "file-103",
      name: "Target_Group_Statistics.csv",
      size: "450 KB",
      type: "spreadsheet",
      uploadedBy: "Alex Developer",
      uploadedAt: "4 days ago",
    },
  ],
}

export async function getMockWorkspaceFiles(workspaceId: string): Promise<WorkspaceFile[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-files-empty") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-files-error") === "true") {
    throw new Error("Failed to load workspace files.")
  }

  return MOCK_FILES[workspaceId] || MOCK_FILES["ws-1"]
}
