import {
    PrismaClient,
    WorkspaceRole,
    DocumentType,
    ActivityType,
    ActivityEntityType,
    NotificationType,
    NotificationEntityType,
} from "@prisma/client";
import * as Y from "yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { hashPassword } from "../src/features/auth/lib/bcrypt.js";

const prisma = new PrismaClient();

// Helper to compute deterministic timestamps relative to current time
function daysAgo(days: number, hours: number = 10, minutes: number = 0): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hours, minutes, 0, 0);
    return d;
}

// Convert TipTap ProseMirror doc JSON to Yjs binary update (V2)
function createSnapshotState(docJson: Record<string, unknown>): Uint8Array<ArrayBuffer> {
    const ydoc = TiptapTransformer.toYdoc(docJson, "default", TiptapTransformer.defaultExtensions);
    const updateV2 = Y.encodeStateAsUpdateV2(ydoc);
    const buf = new Uint8Array(updateV2.byteLength);
    buf.set(updateV2);
    return buf as unknown as Uint8Array<ArrayBuffer>;
}

async function main() {
    console.log("🌱 Starting TeamHub database seed...");

    // 1. Password Hashing
    const hashedPassword = await hashPassword("admin@123");

    // 2. Deterministic Users
    console.log("👤 Seeding users...");
    const usersData = [
        {
            id: "user_admin_001",
            name: "Admin User",
            email: "admin@teamhub.dev",
            password: hashedPassword,
            isEmailVerified: true,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=b6e3f4",
            createdAt: daysAgo(14, 9, 0),
            updatedAt: daysAgo(1, 10, 0),
        },
        {
            id: "user_alice_002",
            name: "Alice Johnson",
            email: "alice@teamhub.dev",
            password: hashedPassword,
            isEmailVerified: true,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice&backgroundColor=ffdfbf",
            createdAt: daysAgo(14, 9, 30),
            updatedAt: daysAgo(1, 11, 0),
        },
        {
            id: "user_bob_003",
            name: "Bob Smith",
            email: "bob@teamhub.dev",
            password: hashedPassword,
            isEmailVerified: true,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob&backgroundColor=c0aede",
            createdAt: daysAgo(13, 10, 0),
            updatedAt: daysAgo(2, 14, 0),
        },
        {
            id: "user_charlie_004",
            name: "Charlie Davis",
            email: "charlie@teamhub.dev",
            password: hashedPassword,
            isEmailVerified: true,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie&backgroundColor=d1d4f9",
            createdAt: daysAgo(12, 11, 0),
            updatedAt: daysAgo(2, 16, 0),
        },
        {
            id: "user_david_005",
            name: "David Wilson",
            email: "david@teamhub.dev",
            password: hashedPassword,
            isEmailVerified: true,
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=ffd5dc",
            createdAt: daysAgo(10, 14, 0),
            updatedAt: daysAgo(3, 9, 0),
        },
    ];

    const users: Record<string, string> = {};
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                name: u.name,
                password: u.password,
                isEmailVerified: u.isEmailVerified,
                avatar: u.avatar,
                updatedAt: u.updatedAt,
            },
            create: u,
        });
        users[u.email] = user.id;
    }
    console.log(`✓ Seeded ${Object.keys(users).length} users.`);

    // 3. Workspaces
    console.log("🏢 Seeding workspaces...");
    const ws1Data = {
        id: "ws_core_eng_001",
        name: "Core Engineering",
        description: "Primary engineering workspace for distributed infrastructure, API design, and core platform roadmap.",
        inviteCode: "ENG-CORE-2026",
        color: "#3B82F6",
        ownerId: users["admin@teamhub.dev"]!,
        createdAt: daysAgo(14, 10, 0),
        updatedAt: daysAgo(1, 10, 0),
    };

    const ws2Data = {
        id: "ws_mobl_plt_002",
        name: "Mobile & Client Platform",
        description: "Dedicated workspace for iOS, Android, and web client platform engineering.",
        inviteCode: "MOB-CLNT-2026",
        color: "#10B981",
        ownerId: users["admin@teamhub.dev"]!,
        createdAt: daysAgo(10, 15, 0),
        updatedAt: daysAgo(2, 11, 0),
    };

    const ws1 = await prisma.workspace.upsert({
        where: { inviteCode: ws1Data.inviteCode },
        update: {
            name: ws1Data.name,
            description: ws1Data.description,
            color: ws1Data.color,
            ownerId: ws1Data.ownerId,
        },
        create: ws1Data,
    });

    const ws2 = await prisma.workspace.upsert({
        where: { inviteCode: ws2Data.inviteCode },
        update: {
            name: ws2Data.name,
            description: ws2Data.description,
            color: ws2Data.color,
            ownerId: ws2Data.ownerId,
        },
        create: ws2Data,
    });

    // 4. Workspace Members
    console.log("👥 Seeding workspace members...");
    // Workspace 1 has all 5 users
    const ws1Members = [
        { userId: users["admin@teamhub.dev"]!, role: WorkspaceRole.OWNER, joinedAt: daysAgo(14, 10, 0) },
        { userId: users["alice@teamhub.dev"]!, role: WorkspaceRole.ADMIN, joinedAt: daysAgo(14, 10, 15) },
        { userId: users["bob@teamhub.dev"]!, role: WorkspaceRole.MEMBER, joinedAt: daysAgo(13, 11, 0) },
        { userId: users["charlie@teamhub.dev"]!, role: WorkspaceRole.MEMBER, joinedAt: daysAgo(12, 11, 30) },
        { userId: users["david@teamhub.dev"]!, role: WorkspaceRole.MEMBER, joinedAt: daysAgo(10, 14, 30) },
    ];

    for (const m of ws1Members) {
        await prisma.workspaceMember.upsert({
            where: {
                workspaceId_userId: {
                    workspaceId: ws1.id,
                    userId: m.userId,
                },
            },
            update: { role: m.role },
            create: {
                workspaceId: ws1.id,
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt,
            },
        });
    }

    // Workspace 2 has exactly Admin (OWNER) + Alice (MEMBER)
    const ws2Members = [
        { userId: users["admin@teamhub.dev"]!, role: WorkspaceRole.OWNER, joinedAt: daysAgo(10, 15, 0) },
        { userId: users["alice@teamhub.dev"]!, role: WorkspaceRole.MEMBER, joinedAt: daysAgo(9, 9, 30) },
    ];

    for (const m of ws2Members) {
        await prisma.workspaceMember.upsert({
            where: {
                workspaceId_userId: {
                    workspaceId: ws2.id,
                    userId: m.userId,
                },
            },
            update: { role: m.role },
            create: {
                workspaceId: ws2.id,
                userId: m.userId,
                role: m.role,
                joinedAt: m.joinedAt,
            },
        });
    }
    console.log("✓ Seeded workspace memberships.");

    // Clean up dependent child records for our seeded workspaces so rerunning is clean & deterministic
    await prisma.$transaction([
        prisma.notification.deleteMany({
            where: { workspaceId: { in: [ws1.id, ws2.id] } },
        }),
        prisma.activity.deleteMany({
            where: { workspaceId: { in: [ws1.id, ws2.id] } },
        }),
        prisma.file.deleteMany({
            where: { workspaceId: { in: [ws1.id, ws2.id] } },
        }),
        prisma.document.deleteMany({
            where: { workspaceId: { in: [ws1.id, ws2.id] } },
        }),
    ]);

    // 5. Documents
    console.log("📄 Seeding documents & TipTap content...");

    const projectRequirementsContent = {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "TeamHub Engineering Requirements & Specifications" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "TeamHub brings documents, real-time collaboration, team messaging, and shared engineering context into a unified workspace environment." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "1. Core Objectives" }],
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
                                    { type: "text", marks: [{ type: "bold" }], text: "Real-time CRDT Document Editing: " },
                                    { type: "text", text: "Conflict-free simultaneous editing powered by Yjs." },
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
                                    { type: "text", marks: [{ type: "bold" }], text: "Context-Aware Team Chat: " },
                                    { type: "text", text: "Persistent chat channels attached directly to documents." },
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
                                    { type: "text", marks: [{ type: "bold" }], text: "Inline Discussions: " },
                                    { type: "text", text: "Threaded comment discussions anchored directly to text selections." },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "2. Security & Handshake Specifications" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "All WebSocket connections require an initial handshake with Bearer token authentication before subscribing to document rooms. Unauthenticated connections are dropped immediately with code 4001." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "3. Non-Functional Requirements" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Sub-50ms message delivery latency across WebSocket clusters, and sub-200ms document cold-start times." },
                ],
            },
        ],
    };

    const apiDesignContent = {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "TeamHub Core API Design & Architecture" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "This document defines the core REST endpoints, WebSocket event contracts, and data models for TeamHub platform services." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "1. Authentication & Session Management" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "We utilize dual-token authentication: a 15-minute access token and a 30-day persistent refresh token." },
                ],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Refresh token rotation with Redis blacklist ensures compromised tokens are invalidated immediately upon detection." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "2. Response Format & Error Standards" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Standardized error response payload ensures every failure adheres to a predictable JSON schema with errorCode, message, and statusCode." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "3. Document Collaboration Endpoints" }],
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
                                    { type: "text", marks: [{ type: "bold" }], text: "GET /api/workspaces/:workspaceId/documents: " },
                                    { type: "text", text: "Lists all collaborative documents in the workspace." },
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
                                    { type: "text", marks: [{ type: "bold" }], text: "POST /api/workspaces/:workspaceId/documents/:documentId/save: " },
                                    { type: "text", text: "Persists document JSON content and binary Yjs snapshot." },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    const meetingNotesContent = {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Engineering Architecture Review Meeting" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", marks: [{ type: "bold" }], text: "Date: " },
                    { type: "text", text: "September 2026 | " },
                    { type: "text", marks: [{ type: "bold" }], text: "Attendees: " },
                    { type: "text", text: "Admin User, Alice Johnson, Bob Smith, Charlie Davis." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Key Architectural Decisions" }],
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
                                    { type: "text", marks: [{ type: "bold" }], text: "Storage: " },
                                    { type: "text", text: "PostgreSQL with Prisma ORM approved as primary relational data store." },
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
                                    { type: "text", marks: [{ type: "bold" }], text: "Real-time Protocol: " },
                                    { type: "text", text: "Socket.IO for chat/presence and Yjs WebSockets for collaborative document synchronization." },
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
                                    { type: "text", marks: [{ type: "bold" }], text: "Cloud Assets: " },
                                    { type: "text", text: "Cloudinary integration for authenticated team asset uploads." },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Action Items" }],
            },
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [{ type: "paragraph", content: [{ type: "text", text: "[Completed] Alice to complete API Design documentation for token rotation." }] }],
                    },
                    {
                        type: "listItem",
                        content: [{ type: "paragraph", content: [{ type: "text", text: "[Completed] Bob to review authentication endpoints and security edge-cases." }] }],
                    },
                    {
                        type: "listItem",
                        content: [{ type: "paragraph", content: [{ type: "text", text: "[In Progress] Charlie to update Q4 engineering roadmap milestones." }] }],
                    },
                    {
                        type: "listItem",
                        content: [{ type: "paragraph", content: [{ type: "text", text: "[Pending] David to verify client-side offline sync with mobile client." }] }],
                    },
                ],
            },
        ],
    };

    const roadmapContent = {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "TeamHub Engineering Roadmap & Milestones" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Quarterly release plan for core collaboration infrastructure and upcoming AI features." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Sprint 1-4: Core Collaboration Platform (Completed)" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Implemented Yjs CRDT real-time editor, channel-based workspace chat, version snapshot history, and file storage." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Sprint 5-8: AI Workspace Assistant (In Progress)" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Integrating workspace-level LLM capabilities: contextual document summarization, @mentions for AI queries, meeting action extraction, and semantic search." },
                ],
            },
        ],
    };

    const projectOverviewContent = {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Mobile & Client Platform Overview" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Technical blueprint and architecture guidelines for the TeamHub mobile and tablet applications." },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Architecture & Shared Core" }],
            },
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "Client state management shares unified TanStack Query hooks and WebSocket protocol models with the web frontend." },
                ],
            },
        ],
    };

    // Create the documents
    const docReq = await prisma.document.create({
        data: {
            id: "doc_req_001",
            title: "Project Requirements",
            icon: "📋",
            type: DocumentType.DOCUMENT,
            content: projectRequirementsContent,
            workspaceId: ws1.id,
            createdById: users["admin@teamhub.dev"]!,
            createdAt: daysAgo(7, 10, 0),
            updatedAt: daysAgo(2, 11, 0),
        },
    });

    const docApi = await prisma.document.create({
        data: {
            id: "doc_api_002",
            title: "API Design",
            icon: "⚡",
            type: DocumentType.DOCUMENT,
            content: apiDesignContent,
            workspaceId: ws1.id,
            createdById: users["alice@teamhub.dev"]!,
            createdAt: daysAgo(6, 11, 0),
            // Most recent updatedAt so it shows up in "Continue Working" on Dashboard!
            updatedAt: new Date(Date.now() - 12 * 60 * 1000),
        },
    });

    const docNotes = await prisma.document.create({
        data: {
            id: "doc_meet_003",
            title: "Meeting Notes",
            icon: "📝",
            type: DocumentType.MEETING_NOTES,
            content: meetingNotesContent,
            workspaceId: ws1.id,
            createdById: users["bob@teamhub.dev"]!,
            createdAt: daysAgo(5, 14, 0),
            updatedAt: daysAgo(1, 16, 0),
        },
    });

    const docRoadmap = await prisma.document.create({
        data: {
            id: "doc_road_004",
            title: "Engineering Roadmap",
            icon: "🗺️",
            type: DocumentType.DOCUMENT,
            content: roadmapContent,
            workspaceId: ws1.id,
            createdById: users["charlie@teamhub.dev"]!,
            createdAt: daysAgo(4, 9, 30),
            updatedAt: daysAgo(1, 15, 0),
        },
    });

    const docOverview = await prisma.document.create({
        data: {
            id: "doc_over_005",
            title: "Project Overview",
            icon: "📱",
            type: DocumentType.DOCUMENT,
            content: projectOverviewContent,
            workspaceId: ws2.id,
            createdById: users["admin@teamhub.dev"]!,
            createdAt: daysAgo(8, 14, 0),
            updatedAt: daysAgo(3, 17, 0),
        },
    });
    console.log("✓ Seeded 5 documents across workspaces.");

    // 6. Document Snapshots
    console.log("📸 Seeding document snapshots for version history...");
    const apiSnapshot1State = createSnapshotState({
        type: "doc",
        content: [
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "TeamHub Core API Design (Draft)" }] },
            { type: "paragraph", content: [{ type: "text", text: "Initial draft of the API endpoints." }] },
        ],
    });

    const apiSnapshot2State = createSnapshotState({
        type: "doc",
        content: [
            ...apiDesignContent.content.slice(0, 3),
        ],
    });

    const apiSnapshot3State = createSnapshotState({
        type: "doc",
        content: [
            ...apiDesignContent.content.slice(0, 5),
        ],
    });

    const apiSnapshot4State = createSnapshotState(apiDesignContent);

    const reqSnapshot1State = createSnapshotState({
        type: "doc",
        content: [
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Requirements Draft" }] },
            { type: "paragraph", content: [{ type: "text", text: "Early draft for team review." }] },
        ],
    });

    const reqSnapshot2State = createSnapshotState(projectRequirementsContent);

    const roadmapSnapshotState = createSnapshotState(roadmapContent);

    await prisma.documentSnapshot.createMany({
        data: [
            // 4 snapshots on API Design (guarantees API Design is "Most edited document" in Analytics)
            {
                id: "snap_api_001",
                documentId: docApi.id,
                createdById: users["alice@teamhub.dev"]!,
                state: apiSnapshot1State,
                description: "Initial API design draft",
                createdAt: daysAgo(5, 12, 0),
            },
            {
                id: "snap_api_002",
                documentId: docApi.id,
                createdById: users["alice@teamhub.dev"]!,
                state: apiSnapshot2State,
                description: "Added authentication & session flow specs",
                createdAt: daysAgo(4, 15, 30),
            },
            {
                id: "snap_api_003",
                documentId: docApi.id,
                createdById: users["bob@teamhub.dev"]!,
                state: apiSnapshot3State,
                description: "Added Redis token blacklist details",
                createdAt: daysAgo(2, 11, 0),
            },
            {
                id: "snap_api_004",
                documentId: docApi.id,
                createdById: users["admin@teamhub.dev"]!,
                state: apiSnapshot4State,
                description: "Finalized v1 endpoint contracts",
                createdAt: daysAgo(1, 16, 20),
            },
            // 2 snapshots on Project Requirements
            {
                id: "snap_req_001",
                documentId: docReq.id,
                createdById: users["admin@teamhub.dev"]!,
                state: reqSnapshot1State,
                description: "Initial requirements outline",
                createdAt: daysAgo(6, 14, 0),
            },
            {
                id: "snap_req_002",
                documentId: docReq.id,
                createdById: users["admin@teamhub.dev"]!,
                state: reqSnapshot2State,
                description: "Added security handshake & WebSocket specs",
                createdAt: daysAgo(3, 10, 0),
            },
            // 1 snapshot on Roadmap
            {
                id: "snap_road_001",
                documentId: docRoadmap.id,
                createdById: users["charlie@teamhub.dev"]!,
                state: roadmapSnapshotState,
                description: "Sprint 5-8 AI assistant deliverables updated",
                createdAt: daysAgo(2, 17, 0),
            },
        ],
    });
    console.log("✓ Seeded 7 document snapshots.");

    // 7. Document Discussions & Replies
    console.log("💬 Seeding document discussions and replies...");
    // Discussion 1: On API Design (Unresolved, multiple replies)
    const disc1 = await prisma.documentDiscussion.create({
        data: {
            id: "disc_api_001",
            documentId: docApi.id,
            createdById: users["bob@teamhub.dev"]!,
            quotedText: "Refresh token rotation with Redis blacklist",
            anchor: {
                from: 140,
                to: 184,
                quotedText: "Refresh token rotation with Redis blacklist",
            },
            resolved: false,
            createdAt: daysAgo(3, 14, 0),
            replies: {
                create: [
                    {
                        id: "reply_disc1_001",
                        createdById: users["bob@teamhub.dev"]!,
                        message: "Should we configure the Redis blacklist key TTL to match the refresh token expiration window of 30 days?",
                        createdAt: daysAgo(3, 14, 0),
                    },
                    {
                        id: "reply_disc1_002",
                        createdById: users["alice@teamhub.dev"]!,
                        message: "Yes, exactly. Once the refresh token expires naturally, the Redis blacklist key can also safely evict.",
                        createdAt: daysAgo(3, 15, 30),
                    },
                    {
                        id: "reply_disc1_003",
                        createdById: users["charlie@teamhub.dev"]!,
                        message: "@Alice Johnson I'll make sure the Redis cluster config allocates enough memory for 30-day token tracking.",
                        createdAt: daysAgo(3, 16, 15),
                    },
                ],
            },
        },
    });

    // Discussion 2: On Project Requirements (Resolved by Admin User)
    const disc2 = await prisma.documentDiscussion.create({
        data: {
            id: "disc_req_002",
            documentId: docReq.id,
            createdById: users["charlie@teamhub.dev"]!,
            quotedText: "All WebSocket connections require an initial handshake with Bearer token",
            anchor: {
                from: 180,
                to: 247,
                quotedText: "All WebSocket connections require an initial handshake with Bearer token",
            },
            resolved: true,
            resolvedAt: daysAgo(2, 16, 0),
            resolvedById: users["admin@teamhub.dev"]!,
            createdAt: daysAgo(4, 11, 0),
            replies: {
                create: [
                    {
                        id: "reply_disc2_001",
                        createdById: users["charlie@teamhub.dev"]!,
                        message: "Do we pass the Bearer token as an auth query param or via socket.io auth options?",
                        createdAt: daysAgo(4, 11, 0),
                    },
                    {
                        id: "reply_disc2_002",
                        createdById: users["admin@teamhub.dev"]!,
                        message: "Socket.io handshake auth payload is the preferred standard so tokens don't leak into web server access logs. Resolved.",
                        createdAt: daysAgo(2, 15, 45),
                    },
                ],
            },
        },
    });

    // Discussion 3: On API Design (Unresolved)
    const disc3 = await prisma.documentDiscussion.create({
        data: {
            id: "disc_api_003",
            documentId: docApi.id,
            createdById: users["alice@teamhub.dev"]!,
            quotedText: "Standardized error response payload",
            anchor: {
                from: 220,
                to: 256,
                quotedText: "Standardized error response payload",
            },
            resolved: false,
            createdAt: daysAgo(1, 10, 30),
            replies: {
                create: [
                    {
                        id: "reply_disc3_001",
                        createdById: users["alice@teamhub.dev"]!,
                        message: "Please check if any client error parsers need the legacy 'error' string field preserved.",
                        createdAt: daysAgo(1, 10, 30),
                    },
                    {
                        id: "reply_disc3_002",
                        createdById: users["david@teamhub.dev"]!,
                        message: "The mobile app already uses Zod to parse the new structure, so no legacy fields needed!",
                        createdAt: daysAgo(1, 12, 10),
                    },
                ],
            },
        },
    });
    console.log("✓ Seeded document discussions and replies.");

    // 8. Chat History, Replies, Mentions, Pinned Messages & Reactions
    console.log("💬 Seeding workspace chat messages...");

    // Msg 1: Alice asks about authentication API
    const msg1 = await prisma.chatMessage.create({
        data: {
            id: "chat_msg_001",
            workspaceId: ws1.id,
            documentId: docApi.id,
            senderId: users["alice@teamhub.dev"]!,
            content: "Has anyone reviewed the authentication API?",
            createdAt: daysAgo(3, 10, 0),
            updatedAt: daysAgo(3, 10, 0),
        },
    });

    // Msg 2: Bob replies to Alice
    const msg2 = await prisma.chatMessage.create({
        data: {
            id: "chat_msg_002",
            workspaceId: ws1.id,
            documentId: docApi.id,
            senderId: users["bob@teamhub.dev"]!,
            content: "I reviewed it. The refresh token flow still needs some changes.",
            replyToId: msg1.id,
            createdAt: daysAgo(3, 10, 5),
            updatedAt: daysAgo(3, 10, 5),
        },
    });

    // Msg 3: Charlie replies with mentions to Alice and Bob
    const msg3 = await prisma.chatMessage.create({
        data: {
            id: "chat_msg_003",
            workspaceId: ws1.id,
            documentId: docApi.id,
            senderId: users["charlie@teamhub.dev"]!,
            content: "@Alice Johnson @Bob Smith I'll update the API design document with the Redis blacklist requirements.",
            replyToId: msg2.id,
            createdAt: daysAgo(3, 10, 12),
            updatedAt: daysAgo(3, 10, 12),
        },
    });

    // Message mentions for Msg 3
    await prisma.messageMention.createMany({
        data: [
            { messageId: msg3.id, userId: users["alice@teamhub.dev"]! },
            { messageId: msg3.id, userId: users["bob@teamhub.dev"]! },
        ],
    });

    // Msg 4: Admin pins an important architectural update
    const msg4 = await prisma.chatMessage.create({
        data: {
            id: "chat_msg_004",
            workspaceId: ws1.id,
            documentId: docApi.id,
            senderId: users["admin@teamhub.dev"]!,
            content: "Reminder: All endpoints must enforce workspace membership checks before performing mutations.",
            isPinned: true,
            pinnedById: users["admin@teamhub.dev"]!,
            pinnedAt: daysAgo(2, 9, 30),
            createdAt: daysAgo(2, 9, 30),
            updatedAt: daysAgo(2, 9, 30),
        },
    });

    // Msg 5: David confirms mobile alignment
    const msg5 = await prisma.chatMessage.create({
        data: {
            id: "chat_msg_005",
            workspaceId: ws1.id,
            documentId: docApi.id,
            senderId: users["david@teamhub.dev"]!,
            content: "Looks great. Mobile client v1.2 will adhere to the new error schema.",
            createdAt: daysAgo(1, 14, 20),
            updatedAt: daysAgo(1, 14, 20),
        },
    });

    // Msg 6: Project Requirements chat
    const msg6 = await prisma.chatMessage.create({
        data: {
            id: "chat_msg_006",
            workspaceId: ws1.id,
            documentId: docReq.id,
            senderId: users["admin@teamhub.dev"]!,
            content: "Welcome team! Please read the project requirements carefully before starting sprint tasks.",
            isPinned: true,
            pinnedById: users["admin@teamhub.dev"]!,
            pinnedAt: daysAgo(6, 10, 0),
            createdAt: daysAgo(6, 10, 0),
            updatedAt: daysAgo(6, 10, 0),
        },
    });

    const msg7 = await prisma.chatMessage.create({
        data: {
            id: "chat_msg_007",
            workspaceId: ws1.id,
            documentId: docReq.id,
            senderId: users["alice@teamhub.dev"]!,
            content: "@Admin User WebSocket specs look solid! All set for real-time collaboration testing.",
            createdAt: daysAgo(5, 11, 30),
            updatedAt: daysAgo(5, 11, 30),
        },
    });

    await prisma.messageMention.create({
        data: {
            messageId: msg7.id,
            userId: users["admin@teamhub.dev"]!,
        },
    });

    // Reactions
    await prisma.messageReaction.createMany({
        data: [
            { messageId: msg1.id, userId: users["bob@teamhub.dev"]!, emoji: "👍" },
            { messageId: msg3.id, userId: users["alice@teamhub.dev"]!, emoji: "🚀" },
            { messageId: msg4.id, userId: users["alice@teamhub.dev"]!, emoji: "👀" },
            { messageId: msg4.id, userId: users["bob@teamhub.dev"]!, emoji: "👍" },
            { messageId: msg6.id, userId: users["charlie@teamhub.dev"]!, emoji: "🔥" },
        ],
    });
    console.log("✓ Seeded chat messages, mentions, and reactions.");

    // 9. Files
    console.log("📁 Seeding workspace files...");
    const filesData = [
        {
            id: "file_arch_001",
            workspaceId: ws1.id,
            uploadedById: users["alice@teamhub.dev"]!,
            originalName: "architecture-diagram.png",
            displayName: "architecture-diagram.png",
            storageKey: "teamhub_demo_arch_diagram",
            url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
            mimeType: "image/png",
            extension: "png",
            size: 245760,
            createdAt: daysAgo(5, 11, 20),
            updatedAt: daysAgo(5, 11, 20),
        },
        {
            id: "file_spec_002",
            workspaceId: ws1.id,
            uploadedById: users["bob@teamhub.dev"]!,
            originalName: "api-specification-v2.yaml",
            displayName: "api-specification-v2.yaml",
            storageKey: "teamhub_demo_api_spec",
            url: "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore.yaml",
            mimeType: "application/x-yaml",
            extension: "yaml",
            size: 48920,
            createdAt: daysAgo(4, 14, 10),
            updatedAt: daysAgo(4, 14, 10),
        },
        {
            id: "file_audit_003",
            workspaceId: ws1.id,
            uploadedById: users["admin@teamhub.dev"]!,
            originalName: "system-security-audit.pdf",
            displayName: "system-security-audit.pdf",
            storageKey: "teamhub_demo_sec_audit",
            url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            mimeType: "application/pdf",
            extension: "pdf",
            size: 1258291,
            createdAt: daysAgo(3, 16, 45),
            updatedAt: daysAgo(3, 16, 45),
        },
        {
            id: "file_load_004",
            workspaceId: ws1.id,
            uploadedById: users["charlie@teamhub.dev"]!,
            originalName: "load-test-benchmark.json",
            displayName: "load-test-benchmark.json",
            storageKey: "teamhub_demo_load_test",
            url: "https://jsonplaceholder.typicode.com/posts",
            mimeType: "application/json",
            extension: "json",
            size: 15360,
            createdAt: daysAgo(2, 10, 0),
            updatedAt: daysAgo(2, 10, 0),
        },
        {
            id: "file_mob_005",
            workspaceId: ws2.id,
            uploadedById: users["alice@teamhub.dev"]!,
            originalName: "mobile-app-wireframe.png",
            displayName: "mobile-app-wireframe.png",
            storageKey: "teamhub_demo_mobile_wireframe",
            url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
            mimeType: "image/png",
            extension: "png",
            size: 412000,
            createdAt: daysAgo(4, 16, 0),
            updatedAt: daysAgo(4, 16, 0),
        },
    ];

    for (const f of filesData) {
        await prisma.file.create({ data: f });
    }
    console.log("✓ Seeded 5 files across workspaces.");

    // 10. Activities (Distributed across past 7 days for Analytics & Dashboard)
    console.log("📊 Seeding workspace activities...");

    const activitiesData = [
        // 6 days ago (Monday/earlier)
        {
            workspaceId: ws1.id,
            actorId: users["admin@teamhub.dev"]!,
            type: ActivityType.WORKSPACE_MEMBER_JOINED,
            entityType: ActivityEntityType.USER,
            entityId: users["admin@teamhub.dev"]!,
            metadata: { memberName: "Admin User" },
            createdAt: daysAgo(6, 9, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.WORKSPACE_MEMBER_JOINED,
            entityType: ActivityEntityType.USER,
            entityId: users["alice@teamhub.dev"]!,
            metadata: { memberName: "Alice Johnson" },
            createdAt: daysAgo(6, 9, 30),
        },
        {
            workspaceId: ws1.id,
            actorId: users["admin@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_CREATED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docReq.id,
            metadata: { title: "Project Requirements" },
            createdAt: daysAgo(6, 10, 0),
        },
        // 5 days ago
        {
            workspaceId: ws1.id,
            actorId: users["bob@teamhub.dev"]!,
            type: ActivityType.WORKSPACE_MEMBER_JOINED,
            entityType: ActivityEntityType.USER,
            entityId: users["bob@teamhub.dev"]!,
            metadata: { memberName: "Bob Smith" },
            createdAt: daysAgo(5, 10, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_CREATED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docApi.id,
            metadata: { title: "API Design" },
            createdAt: daysAgo(5, 11, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.FILE_CREATED,
            entityType: ActivityEntityType.FILE,
            entityId: "file_arch_001",
            metadata: { displayName: "architecture-diagram.png", originalName: "architecture-diagram.png", size: 245760 },
            createdAt: daysAgo(5, 11, 20),
        },
        {
            workspaceId: ws1.id,
            actorId: users["bob@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_CREATED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docNotes.id,
            metadata: { title: "Meeting Notes" },
            createdAt: daysAgo(5, 14, 0),
        },
        // 4 days ago
        {
            workspaceId: ws1.id,
            actorId: users["charlie@teamhub.dev"]!,
            type: ActivityType.WORKSPACE_MEMBER_JOINED,
            entityType: ActivityEntityType.USER,
            entityId: users["charlie@teamhub.dev"]!,
            metadata: { memberName: "Charlie Davis" },
            createdAt: daysAgo(4, 9, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["charlie@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_CREATED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docRoadmap.id,
            metadata: { title: "Engineering Roadmap" },
            createdAt: daysAgo(4, 9, 30),
        },
        {
            workspaceId: ws1.id,
            actorId: users["bob@teamhub.dev"]!,
            type: ActivityType.FILE_CREATED,
            entityType: ActivityEntityType.FILE,
            entityId: "file_spec_002",
            metadata: { displayName: "api-specification-v2.yaml", originalName: "api-specification-v2.yaml", size: 48920 },
            createdAt: daysAgo(4, 14, 10),
        },
        // Workspace 2 activities
        {
            workspaceId: ws2.id,
            actorId: users["admin@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_CREATED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docOverview.id,
            metadata: { title: "Project Overview" },
            createdAt: daysAgo(4, 15, 0),
        },
        {
            workspaceId: ws2.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.FILE_CREATED,
            entityType: ActivityEntityType.FILE,
            entityId: "file_mob_005",
            metadata: { displayName: "mobile-app-wireframe.png", originalName: "mobile-app-wireframe.png", size: 412000 },
            createdAt: daysAgo(4, 16, 0),
        },
        // 3 days ago (Peak activity day in WS1)
        {
            workspaceId: ws1.id,
            actorId: users["david@teamhub.dev"]!,
            type: ActivityType.WORKSPACE_MEMBER_JOINED,
            entityType: ActivityEntityType.USER,
            entityId: users["david@teamhub.dev"]!,
            metadata: { memberName: "David Wilson" },
            createdAt: daysAgo(3, 10, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["admin@teamhub.dev"]!,
            type: ActivityType.MEMBER_ROLE,
            entityType: ActivityEntityType.MEMBER,
            entityId: users["alice@teamhub.dev"]!,
            metadata: { memberName: "Alice Johnson", oldRole: "MEMBER", newRole: "ADMIN" },
            createdAt: daysAgo(3, 10, 30),
        },
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_RENAMED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docApi.id,
            metadata: { oldTitle: "API Specification Draft", newTitle: "API Design" },
            createdAt: daysAgo(3, 11, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["admin@teamhub.dev"]!,
            type: ActivityType.FILE_CREATED,
            entityType: ActivityEntityType.FILE,
            entityId: "file_audit_003",
            metadata: { displayName: "system-security-audit.pdf", originalName: "system-security-audit.pdf", size: 1258291 },
            createdAt: daysAgo(3, 16, 45),
        },
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.FILE_RENAMED,
            entityType: ActivityEntityType.FILE,
            entityId: "file_arch_001",
            metadata: { oldDisplayName: "arch-v1.png", newDisplayName: "architecture-diagram.png" },
            createdAt: daysAgo(3, 17, 0),
        },
        // 2 days ago
        {
            workspaceId: ws1.id,
            actorId: users["charlie@teamhub.dev"]!,
            type: ActivityType.FILE_CREATED,
            entityType: ActivityEntityType.FILE,
            entityId: "file_load_004",
            metadata: { displayName: "load-test-benchmark.json", originalName: "load-test-benchmark.json", size: 15360 },
            createdAt: daysAgo(2, 10, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_RENAMED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docReq.id,
            metadata: { oldTitle: "Project Specs", newTitle: "Project Requirements" },
            createdAt: daysAgo(2, 15, 0),
        },
        // 1 day ago
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_CREATED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docApi.id,
            metadata: { title: "API Design" },
            createdAt: daysAgo(1, 11, 0),
        },
        {
            workspaceId: ws1.id,
            actorId: users["bob@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_RENAMED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docNotes.id,
            metadata: { oldTitle: "Architecture Sync", newTitle: "Meeting Notes" },
            createdAt: daysAgo(1, 16, 0),
        },
        // Today (Recent Activity on Dashboard)
        {
            workspaceId: ws1.id,
            actorId: users["alice@teamhub.dev"]!,
            type: ActivityType.DOCUMENT_RENAMED,
            entityType: ActivityEntityType.DOCUMENT,
            entityId: docApi.id,
            metadata: { oldTitle: "API Design v1", newTitle: "API Design" },
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
        },
        {
            workspaceId: ws1.id,
            actorId: users["admin@teamhub.dev"]!,
            type: ActivityType.MEMBER_ROLE,
            entityType: ActivityEntityType.MEMBER,
            entityId: users["bob@teamhub.dev"]!,
            metadata: { memberName: "Bob Smith", oldRole: "MEMBER", newRole: "MEMBER" },
            createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        },
    ];

    for (const a of activitiesData) {
        await prisma.activity.create({ data: a });
    }
    console.log(`✓ Seeded ${activitiesData.length} workspace activities across past 7 days.`);

    // 11. Notifications
    console.log("🔔 Seeding notifications for users...");
    const notificationsData = [
        // 1. CHAT_MENTION for Alice
        {
            recipientId: users["alice@teamhub.dev"]!,
            actorId: users["charlie@teamhub.dev"]!,
            workspaceId: ws1.id,
            type: NotificationType.CHAT_MENTION,
            entityType: NotificationEntityType.CHAT_MESSAGE,
            entityId: msg3.id,
            metadata: {
                documentId: docApi.id,
                messageContent: "@Alice Johnson @Bob Smith I'll update the API design document with the Redis blacklist requirements.",
            },
            read: false,
            createdAt: daysAgo(1, 10, 12),
        },
        // 2. CHAT_MENTION for Bob
        {
            recipientId: users["bob@teamhub.dev"]!,
            actorId: users["charlie@teamhub.dev"]!,
            workspaceId: ws1.id,
            type: NotificationType.CHAT_MENTION,
            entityType: NotificationEntityType.CHAT_MESSAGE,
            entityId: msg3.id,
            metadata: {
                documentId: docApi.id,
                messageContent: "@Alice Johnson @Bob Smith I'll update the API design document with the Redis blacklist requirements.",
            },
            read: true,
            readAt: daysAgo(1, 11, 0),
            createdAt: daysAgo(1, 10, 12),
        },
        // 3. CHAT_MENTION for Admin User
        {
            recipientId: users["admin@teamhub.dev"]!,
            actorId: users["alice@teamhub.dev"]!,
            workspaceId: ws1.id,
            type: NotificationType.CHAT_MENTION,
            entityType: NotificationEntityType.CHAT_MESSAGE,
            entityId: msg7.id,
            metadata: {
                documentId: docReq.id,
                messageContent: "@Admin User WebSocket specs look solid! All set for real-time collaboration testing.",
            },
            read: false,
            createdAt: daysAgo(1, 11, 30),
        },
        // 4. DISCUSSION_REPLY for Bob (Alice replied)
        {
            recipientId: users["bob@teamhub.dev"]!,
            actorId: users["alice@teamhub.dev"]!,
            workspaceId: ws1.id,
            type: NotificationType.DISCUSSION_REPLY,
            entityType: NotificationEntityType.DISCUSSION,
            entityId: disc1.id,
            metadata: {
                documentId: docApi.id,
                messageContent: "Yes, exactly. Once the refresh token expires naturally, the Redis blacklist key can also safely evict.",
            },
            read: false,
            createdAt: daysAgo(2, 15, 30),
        },
        // 5. DISCUSSION_MENTION for Alice
        {
            recipientId: users["alice@teamhub.dev"]!,
            actorId: users["charlie@teamhub.dev"]!,
            workspaceId: ws1.id,
            type: NotificationType.DISCUSSION_MENTION,
            entityType: NotificationEntityType.DISCUSSION,
            entityId: disc1.id,
            metadata: {
                documentId: docApi.id,
                quotedText: "Refresh token rotation with Redis blacklist",
                messageContent: "@Alice Johnson I'll make sure the Redis cluster config allocates enough memory for 30-day token tracking.",
            },
            read: true,
            readAt: daysAgo(2, 17, 0),
            createdAt: daysAgo(2, 16, 15),
        },
        // 6. DISCUSSION_RESOLVED for Charlie (Admin resolved)
        {
            recipientId: users["charlie@teamhub.dev"]!,
            actorId: users["admin@teamhub.dev"]!,
            workspaceId: ws1.id,
            type: NotificationType.DISCUSSION_RESOLVED,
            entityType: NotificationEntityType.DISCUSSION,
            entityId: disc2.id,
            metadata: {
                documentId: docReq.id,
                quotedText: "All WebSocket connections require an initial handshake with Bearer token",
            },
            read: true,
            readAt: daysAgo(2, 16, 30),
            createdAt: daysAgo(2, 16, 0),
        },
        // 7. WORKSPACE_ROLE_CHANGED for Alice (Promoted to ADMIN by Admin User)
        {
            recipientId: users["alice@teamhub.dev"]!,
            actorId: users["admin@teamhub.dev"]!,
            workspaceId: ws1.id,
            type: NotificationType.WORKSPACE_ROLE_CHANGED,
            entityType: NotificationEntityType.WORKSPACE,
            entityId: ws1.id,
            metadata: {
                oldRole: "MEMBER",
                newRole: "ADMIN",
            },
            read: false,
            createdAt: daysAgo(3, 10, 30),
        },
    ];

    for (const n of notificationsData) {
        await prisma.notification.create({ data: n });
    }
    console.log(`✓ Seeded ${notificationsData.length} notifications.`);

    console.log("✨ TeamHub development seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
