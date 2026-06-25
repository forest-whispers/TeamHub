import type { ConversationMetadata, ConversationDetail, Message } from "../types"

const LATENCY = 1000

function seedMockAIData(workspaceId: string) {
  const metadataKey = `teamhub-mock-ai-metadata-${workspaceId}`
  if (localStorage.getItem(metadataKey)) return

  const defaultMeta: ConversationMetadata[] = [
    {
      id: `${workspaceId}-conv-1`,
      title: "Workspace Overview",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      lastMessagePreview: "This workspace, Engineering Team, contains...",
      metadata: { workspaceId }
    },
    {
      id: `${workspaceId}-conv-2`,
      title: "Active Member Query",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      lastMessagePreview: "Here are the active members online right...",
      metadata: { workspaceId }
    }
  ]

  localStorage.setItem(metadataKey, JSON.stringify(defaultMeta))

  // Seed details
  const detail1Key = `teamhub-mock-ai-detail-${workspaceId}-conv-1`
  const detail1: ConversationDetail = {
    id: `${workspaceId}-conv-1`,
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Summarize this workspace",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60).toISOString(),
        status: "sent"
      },
      {
        id: "m2",
        role: "assistant",
        content: "This workspace, **Engineering Team**, contains 24 documents, 12 active members, and shows high collaboration. The core topics are API Architecture, Release Checklists, and Database schema designs.",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: "sent"
      }
    ]
  }
  localStorage.setItem(detail1Key, JSON.stringify(detail1))

  const detail2Key = `teamhub-mock-ai-detail-${workspaceId}-conv-2`
  const detail2: ConversationDetail = {
    id: `${workspaceId}-conv-2`,
    messages: [
      {
        id: "m3",
        role: "user",
        content: "Show active members",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2 - 1000 * 60).toISOString(),
        status: "sent"
      },
      {
        id: "m4",
        role: "assistant",
        content: "Here are the active members online right now in the workspace:\n- **Alex Developer** (Owner • Online)\n- **Jamie Product** (Product Manager • Online)\n- **Casey Coder** (Frontend Engineer • Online)\n- **Taylor Support** (Support Lead • Away)",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: "sent"
      }
    ]
  }
  localStorage.setItem(detail2Key, JSON.stringify(detail2))
}

export async function getMockConversations(workspaceId: string): Promise<ConversationMetadata[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  seedMockAIData(workspaceId)

  const metadataKey = `teamhub-mock-ai-metadata-${workspaceId}`
  const stored = localStorage.getItem(metadataKey)
  return stored ? JSON.parse(stored) : []
}

export async function getMockConversation(workspaceId: string, conversationId: string): Promise<ConversationDetail> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  seedMockAIData(workspaceId)

  const detailKey = `teamhub-mock-ai-detail-${conversationId}`
  const stored = localStorage.getItem(detailKey)
  if (!stored) {
    throw new Error("Conversation not found.")
  }
  return JSON.parse(stored)
}

export async function createMockConversation(workspaceId: string, title = "New Conversation"): Promise<ConversationMetadata> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  seedMockAIData(workspaceId)

  const metadataKey = `teamhub-mock-ai-metadata-${workspaceId}`
  const storedMeta = localStorage.getItem(metadataKey)
  const list: ConversationMetadata[] = storedMeta ? JSON.parse(storedMeta) : []

  const newMeta: ConversationMetadata = {
    id: `conv-${Math.random().toString(36).substring(2, 9)}`,
    title,
    createdAt: new Date().toISOString(),
    lastMessagePreview: "No messages yet.",
    metadata: { workspaceId }
  }

  list.unshift(newMeta)
  localStorage.setItem(metadataKey, JSON.stringify(list))

  const detailKey = `teamhub-mock-ai-detail-${newMeta.id}`
  const detail: ConversationDetail = {
    id: newMeta.id,
    messages: []
  }
  localStorage.setItem(detailKey, JSON.stringify(detail))

  return newMeta
}

export async function mockSendMessage(
  workspaceId: string,
  conversationId: string,
  content: string
): Promise<ConversationDetail> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, LATENCY))
  seedMockAIData(workspaceId)

  const detailKey = `teamhub-mock-ai-detail-${conversationId}`
  const storedDetail = localStorage.getItem(detailKey)
  if (!storedDetail) {
    throw new Error("Conversation not found.")
  }

  const detail: ConversationDetail = JSON.parse(storedDetail)
  const isFirstMessage = detail.messages.length === 0

  // 1. Add user message
  const userMsg: Message = {
    id: `msg-${Math.random().toString(36).substring(2, 9)}`,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
    status: "sent"
  }
  detail.messages.push(userMsg)

  // 2. Generate contextual response
  let replyText = ""
  const normalized = content.trim().toLowerCase()

  if (normalized.includes("summarize this workspace")) {
    replyText = "This workspace, **Engineering Team**, is dedicated to core engineering specifications, roadmap, and development guides. It contains 24 documents, 12 active members, and shows high collaboration. The main topics cover API Architecture, Release Checklists, and Database schema designs."
  } else if (normalized.includes("explain this document")) {
    replyText = "Sure! Please open a document from the Documents tab, and I can help you summarize or analyze its contents. Currently, I see you are looking at the workspace resources. Let me know which document you'd like to dive into!"
  } else if (normalized.includes("find recently edited documents")) {
    replyText = "The most recently edited documents in this workspace are:\n1. **API Architecture Guidelines** (edited 2 hours ago by Alex Developer)\n2. **Database Schema Draft** (edited Yesterday by Jamie Product)\n3. **Release Checklist v1.2** (edited 3 days ago by Taylor Support)"
  } else if (normalized.includes("show active members")) {
    replyText = "Here are the active members online right now in the workspace:\n- **Alex Developer** (Owner • Online)\n- **Jamie Product** (Product Manager • Online)\n- **Casey Coder** (Frontend Engineer • Online)\n- **Taylor Support** (Support Lead • Away)"
  } else if (normalized.includes("what changed today")) {
    replyText = "Today in the workspace:\n- **Alex Developer** updated the *API Architecture Guidelines*.\n- **Jamie Product** created a new document draft.\n- Active discussions occurred in the *Live Chat*."
  } else {
    replyText = "I am your workspace-aware AI assistant. I can help you search files, summarize documents, list active members, or answer questions about your team's workflow. Let me know what you need!"
  }

  const assistantMsg: Message = {
    id: `msg-${Math.random().toString(36).substring(2, 9)}`,
    role: "assistant",
    content: replyText,
    createdAt: new Date().toISOString(),
    status: "sent"
  }
  detail.messages.push(assistantMsg)

  // Save updated detail
  localStorage.setItem(detailKey, JSON.stringify(detail))

  // 3. Update Conversation Title & lastMessagePreview in Metadata list
  const metadataKey = `teamhub-mock-ai-metadata-${workspaceId}`
  const storedMeta = localStorage.getItem(metadataKey)
  if (storedMeta) {
    const list: ConversationMetadata[] = JSON.parse(storedMeta)
    const meta = list.find((m) => m.id === conversationId)
    if (meta) {
      if (isFirstMessage) {
        meta.title = content.length > 28 ? content.substring(0, 25) + "..." : content
      }
      meta.lastMessagePreview = replyText.length > 40 ? replyText.substring(0, 37) + "..." : replyText
      localStorage.setItem(metadataKey, JSON.stringify(list))
    }
  }

  return detail
}
