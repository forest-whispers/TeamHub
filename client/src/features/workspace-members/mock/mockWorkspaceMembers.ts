import type { WorkspaceMember, WorkspaceMemberDetails } from "../types"

const LATENCY = 500

const MOCK_MEMBERS: Record<string, WorkspaceMember[]> = {
  "ws-1": [
    {
      id: "mem-1",
      name: "Alex Developer",
      email: "alex.dev@teamhub.com",
      role: "Owner",
      status: "online",
    },
    {
      id: "mem-2",
      name: "Jamie Product",
      email: "jamie.prod@teamhub.com",
      role: "Product Manager",
      status: "online",
    },
    {
      id: "mem-3",
      name: "Taylor Support",
      email: "taylor.sup@teamhub.com",
      role: "Support Lead",
      status: "away",
    },
    {
      id: "mem-4",
      name: "Morgan Designer",
      email: "morgan.des@teamhub.com",
      role: "UI Designer",
      status: "offline",
    },
    {
      id: "mem-5",
      name: "Casey Coder",
      email: "casey.code@teamhub.com",
      role: "Frontend Engineer",
      status: "online",
    },
    {
      id: "mem-6",
      name: "Sam Server",
      email: "sam.srv@teamhub.com",
      role: "Backend Engineer",
      status: "offline",
    },
    {
      id: "mem-7",
      name: "Quinn Tester",
      email: "quinn.test@teamhub.com",
      role: "QA Engineer",
      status: "offline",
    },
    {
      id: "mem-8",
      name: "Pat Architect",
      email: "pat.arch@teamhub.com",
      role: "Tech Lead",
      status: "online",
    },
  ],
  "ws-2": [
    {
      id: "mem-1",
      name: "Alex Developer",
      email: "alex.dev@teamhub.com",
      role: "Admin",
      status: "online",
    },
    {
      id: "mem-2",
      name: "Jamie Product",
      email: "jamie.prod@teamhub.com",
      role: "Owner",
      status: "online",
    },
    {
      id: "mem-4",
      name: "Morgan Designer",
      email: "morgan.des@teamhub.com",
      role: "UI Designer",
      status: "offline",
    },
    {
      id: "mem-5",
      name: "Casey Coder",
      email: "casey.code@teamhub.com",
      role: "Frontend Engineer",
      status: "away",
    },
  ],
}

export async function getMockWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (localStorage.getItem("teamhub-mock-members-empty") === "true") {
    return []
  }

  if (localStorage.getItem("teamhub-mock-members-error") === "true") {
    throw new Error("Failed to load workspace members.")
  }

  return MOCK_MEMBERS[workspaceId] || MOCK_MEMBERS["ws-1"]
}

export async function getMockMemberDetails(
  workspaceId: string,
  memberId: string
): Promise<WorkspaceMemberDetails> {
  await new Promise((resolve) => setTimeout(resolve, LATENCY))

  if (
    localStorage.getItem("teamhub-mock-member-details-error") === "true" ||
    localStorage.getItem("teamhub-mock-members-error") === "true"
  ) {
    throw new Error("Failed to load member details.")
  }

  const members = MOCK_MEMBERS[workspaceId] || MOCK_MEMBERS["ws-1"]
  const member = members.find((m) => m.id === memberId)

  if (!member) {
    throw new Error("Member not found.")
  }

  const bios: Record<string, string> = {
    "mem-1": "Lead software engineer specializing in building full-stack applications with React, TypeScript, and Node.js. Passionate about clean architecture and developer productivity tools.",
    "mem-2": "Product manager focused on building collaborative workspaces and editor features. Always looking for ways to streamline developer workflows and user experience.",
    "mem-3": "Customer support advocate with deep technical knowledge. Dedicated to resolving customer issues and ensuring a smooth user onboarding experience.",
    "mem-4": "UI/UX designer with 5+ years of experience. Creates intuitive user flows, visually stunning interfaces, and clean component design systems.",
    "mem-5": "Frontend developer obsessed with performance, accessibility, and micro-interactions. Loves writing clean, reusable React components.",
    "mem-6": "Backend developer focusing on database performance, scalable API design, and real-time communication protocols (WebSockets).",
    "mem-7": "QA engineer dedicated to automated testing, performance benchmarks, and regression testing. Ensuring the highest software quality releases.",
    "mem-8": "Software architect who designs scalable system infrastructures, coordinates tech stack selections, and mentors engineering teams.",
  }

  const joinedDates: Record<string, string> = {
    "mem-1": "June 12, 2024",
    "mem-2": "July 1, 2024",
    "mem-3": "August 15, 2024",
    "mem-4": "September 20, 2024",
    "mem-5": "October 5, 2024",
    "mem-6": "November 10, 2024",
    "mem-7": "December 1, 2024",
    "mem-8": "January 15, 2025",
  }

  const lastActiveTimes: Record<string, string> = {
    "mem-1": "Just now",
    "mem-2": "5 minutes ago",
    "mem-3": "1 hour ago",
    "mem-4": "Yesterday",
    "mem-5": "3 minutes ago",
    "mem-6": "2 days ago",
    "mem-7": "3 hours ago",
    "mem-8": "Just now",
  }

  return {
    ...member,
    joinedDate: joinedDates[member.id] || "January 1, 2025",
    lastActive: lastActiveTimes[member.id] || "Just now",
    bio: bios[member.id] || "Collaborative team member at TeamHub. Always working on shipping quality product features and improving team workflows.",
  }
}

