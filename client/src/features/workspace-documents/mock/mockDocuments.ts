import type { WorkspaceDocument } from "../types"

const LATENCY = 600

const MOCK_DOCUMENTS: WorkspaceDocument[] = [
  {
    id: "doc-1",
    name: "API Architecture Guidelines",
    lastEdited: "2 hours ago",
    lastEditedBy: "Alex Developer",
    createdAt: "2026-06-20",
    workspaceId: "ws-1",
  },
  {
    id: "doc-2",
    name: "Database Schema Draft",
    lastEdited: "Yesterday",
    lastEditedBy: "Jamie Product",
    createdAt: "2026-06-18",
    workspaceId: "ws-1",
  },
  {
    id: "doc-3",
    name: "Release Checklist v1.2",
    lastEdited: "3 days ago",
    lastEditedBy: "Taylor Support",
    createdAt: "2026-06-15",
    workspaceId: "ws-1",
  },
  {
    id: "doc-4",
    name: "Marketing Strategy 2026",
    lastEdited: "4 hours ago",
    lastEditedBy: "Jamie Product",
    createdAt: "2026-06-21",
    workspaceId: "ws-2",
  },
  {
    id: "doc-5",
    name: "Launch Plan Roadmap",
    lastEdited: "3 days ago",
    lastEditedBy: "Alex Developer",
    createdAt: "2026-06-10",
    workspaceId: "ws-2",
  },
  {
    id: "doc-6",
    name: "Customer Feedback Summary",
    lastEdited: "5 days ago",
    lastEditedBy: "Taylor Support",
    createdAt: "2026-06-12",
    workspaceId: "ws-3",
  },
]

export async function getMockDocuments(workspaceId: string): Promise<WorkspaceDocument[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-docs-error") === "true") {
    throw new Error("Failed to load workspace documents.")
  }

  if (localStorage.getItem("teamhub-mock-docs-empty") === "true") {
    return []
  }

  // Filter documents by active workspaceId
  return MOCK_DOCUMENTS.filter((doc) => doc.workspaceId === workspaceId)
}

export async function renameMockDocument(
  _workspaceId: string,
  documentId: string,
  newName: string
): Promise<WorkspaceDocument> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-docs-error") === "true") {
    throw new Error("Failed to rename document.")
  }

  const doc = MOCK_DOCUMENTS.find((d) => d.id === documentId)
  if (!doc) {
    throw new Error("Document not found.")
  }

  doc.name = newName
  return { ...doc }
}

export async function deleteMockDocument(
  workspaceId: string,
  documentId: string
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-docs-error") === "true") {
    throw new Error("Failed to delete document.")
  }

  const index = MOCK_DOCUMENTS.findIndex((d) => d.id === documentId && d.workspaceId === workspaceId)
  if (index === -1) {
    throw new Error("Document not found.")
  }

  MOCK_DOCUMENTS.splice(index, 1)
}

