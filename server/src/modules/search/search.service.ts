import { prisma } from "../../lib/prisma.js";
import type { SearchResponse, SearchResult } from "./search.types.js";

export const executeSearch = async (
    userId: string,
    activeWorkspaceId: string,
    query: string
): Promise<SearchResponse> => {
    // Execute all Prisma queries concurrently
    const [docs, files, members, discussions, chats] = await Promise.all([
        // 1. Documents
        prisma.document.findMany({
            where: {
                workspaceId: activeWorkspaceId,
                title: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            take: 10,
            select: {
                id: true,
                title: true,
                workspaceId: true,
                createdAt: true,
                createdBy: {
                    select: {
                        name: true,
                    },
                },
            },
        }),

        // 2. Files
        prisma.file.findMany({
            where: {
                workspaceId: activeWorkspaceId,
                OR: [
                    {
                        displayName: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        originalName: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            take: 10,
            select: {
                id: true,
                displayName: true,
                originalName: true,
                workspaceId: true,
                createdAt: true,
                uploadedBy: {
                    select: {
                        name: true,
                    },
                },
            },
        }),

        // 3. Workspace Members
        prisma.workspaceMember.findMany({
            where: {
                workspaceId: activeWorkspaceId,
                OR: [
                    {
                        user: {
                            name: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    },
                    {
                        user: {
                            email: {
                                contains: query,
                                mode: "insensitive",
                            },
                        },
                    },
                ],
            },
            take: 10,
            select: {
                id: true,
                workspaceId: true,
                joinedAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        }),

        // 4. Discussions
        prisma.documentDiscussion.findMany({
            where: {
                document: {
                    workspaceId: activeWorkspaceId,
                },
                replies: {
                    some: {
                        message: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                },
            },
            take: 10,
            select: {
                id: true,
                documentId: true,
                createdAt: true,
                document: {
                    select: {
                        title: true,
                        workspaceId: true,
                    },
                },
                replies: {
                    select: {
                        message: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        }),

        // 5. Chat Messages
        prisma.chatMessage.findMany({
            where: {
                workspaceId: activeWorkspaceId,
                content: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            take: 10,
            select: {
                id: true,
                documentId: true,
                content: true,
                workspaceId: true,
                createdAt: true,
                sender: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
    ]);

    // Normalize Documents
    const docResults = docs.map(doc => ({
        id: `DOCUMENT-${doc.id}`,
        type: "DOCUMENT" as const,
        title: doc.title,
        description: `Created by ${doc.createdBy.name}`,
        entityId: doc.id,
        workspaceId: doc.workspaceId,
        score: 100,
        createdAt: doc.createdAt,
    }));

    // Normalize Files
    const fileResults = files.map(file => ({
        id: `FILE-${file.id}`,
        type: "FILE" as const,
        title: file.displayName || file.originalName,
        description: `Uploaded by ${file.uploadedBy.name}`,
        entityId: file.id,
        workspaceId: file.workspaceId,
        score: 90,
        createdAt: file.createdAt,
    }));

    // Normalize Workspace Members
    const memberResults = members.map(member => ({
        id: `MEMBER-${member.id}`,
        type: "MEMBER" as const,
        title: member.user.name,
        description: member.user.email,
        entityId: member.id,
        workspaceId: member.workspaceId,
        score: 80,
        createdAt: member.joinedAt,
    }));

    // Normalize Discussions
    const discussionResults = discussions.map(disc => {
        const matchingReply = disc.replies.find(r =>
            r.message.toLowerCase().includes(query.toLowerCase())
        ) || disc.replies[0];

        return {
            id: `DISCUSSION-${disc.id}`,
            type: "DISCUSSION" as const,
            title: disc.document.title,
            description: matchingReply ? matchingReply.message : "",
            entityId: disc.id,
            workspaceId: disc.document.workspaceId,
            score: 70,
            createdAt: disc.createdAt,
            documentId: disc.documentId,
        };
    });

    // Normalize Chat Messages
    const chatResults = chats.map(msg => ({
        id: `CHAT-${msg.id}`,
        type: "CHAT" as const,
        title: msg.content,
        description: `Sent by ${msg.sender.name}`,
        entityId: msg.id,
        workspaceId: msg.workspaceId,
        score: 60,
        createdAt: msg.createdAt,
        documentId: msg.documentId,
    }));

    // Merge all results
    const allResults = [
        ...docResults,
        ...fileResults,
        ...memberResults,
        ...discussionResults,
        ...chatResults,
    ];

    // Sort by score descending, then by createdAt descending
    allResults.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score;
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Map to final contract (strip createdAt)
    const normalizedResults: SearchResult[] = allResults.map(res => ({
        id: res.id,
        type: res.type,
        title: res.title,
        description: res.description,
        entityId: res.entityId,
        workspaceId: res.workspaceId,
        score: res.score,
        documentId: (res as any).documentId,
    }));

    return {
        results: normalizedResults,
    };
};