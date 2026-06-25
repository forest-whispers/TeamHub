import type { WorkspaceDocumentDetail } from "../types"

const LATENCY = 500

const MOCK_DETAILS: Record<string, WorkspaceDocumentDetail> = {
  "doc-1": {
    id: "doc-1",
    name: "API Architecture Guidelines",
    lastEdited: "2 hours ago",
    lastEditedBy: "Alex Developer",
    createdAt: "2026-06-20",
    workspaceId: "ws-1",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "API Architecture Guidelines" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "This document details the core guidelines for building and extending the TeamHub API. Follow REST conventions, use consistent JSON naming standards (camelCase), and structure error payloads clearly.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Core Endpoints Schema" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "GET /api/workspaces - Lists active workspaces" },
                  ],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [
                    { type: "text", text: "GET /api/workspaces/:id/documents - Lists workspace files" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  "doc-2": {
    id: "doc-2",
    name: "Database Schema Draft",
    lastEdited: "Yesterday",
    lastEditedBy: "Jamie Product",
    createdAt: "2026-06-18",
    workspaceId: "ws-1",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Database Schema Draft" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Proposed entity relationship structure for the database backend store. Focuses on document version histories and workspace collaboration permissions.",
            },
          ],
        },
      ],
    },
  },
  "doc-3": {
    id: "doc-3",
    name: "Release Checklist v1.2",
    lastEdited: "3 days ago",
    lastEditedBy: "Taylor Support",
    createdAt: "2026-06-15",
    workspaceId: "ws-1",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Release Checklist v1.2" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Verify persistent Workspace Layout shell routing" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Check Tiptap Editor starts with StarterKit extensions" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Verify dirty-state comparison tracks edits relative to database values" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  "doc-4": {
    id: "doc-4",
    name: "Marketing Strategy 2026",
    lastEdited: "4 hours ago",
    lastEditedBy: "Jamie Product",
    createdAt: "2026-06-21",
    workspaceId: "ws-2",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Marketing Strategy 2026" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Workspace marketing campaigns and target group reach outlines for 2026 launch tracks.",
            },
          ],
        },
      ],
    },
  },
  "doc-5": {
    id: "doc-5",
    name: "Launch Plan Roadmap",
    lastEdited: "3 days ago",
    lastEditedBy: "Alex Developer",
    createdAt: "2026-06-10",
    workspaceId: "ws-2",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Launch Plan Roadmap" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Timeline roadmap charting cross-functional launch deliverables from design to deploy.",
            },
          ],
        },
      ],
    },
  },
  "doc-6": {
    id: "doc-6",
    name: "Customer Feedback Summary",
    lastEdited: "5 days ago",
    lastEditedBy: "Taylor Support",
    createdAt: "2026-06-12",
    workspaceId: "ws-3",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Customer Feedback Summary" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Summarized insights from support tickets and customer focus group research metrics.",
            },
          ],
        },
      ],
    },
  },
}

export async function getMockDocument(workspaceId: string, documentId: string): Promise<WorkspaceDocumentDetail> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-editor-error") === "true") {
    throw new Error("Failed to load document content.")
  }

  const detail = MOCK_DETAILS[documentId]

  return (
    detail || {
      id: documentId,
      name: "Untitled Document",
      lastEdited: "Just now",
      lastEditedBy: "Alex Developer",
      createdAt: "2026-06-25",
      workspaceId: workspaceId,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Untitled Document" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Start writing your document here...",
              },
            ],
          },
        ],
      },
    }
  )
}
