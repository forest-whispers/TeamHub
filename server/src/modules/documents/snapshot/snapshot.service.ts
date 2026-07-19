import { Prisma } from "@prisma/client";
import { prisma } from "../../../lib/prisma.js";
import type { CreateSnapshotInput } from "./snapshot.types.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";

class SnapshotService {

    async createSnapshot(tx: Prisma.TransactionClient, input: CreateSnapshotInput) {
        await tx.documentSnapshot.create({
            data: {
                documentId: input.documentId,
                createdById: input.createdById,
                // state: input.state,
                state: Buffer.from(input.state),
                description: input.description ?? null,
            },
        });
    }

    async listSnapshots(requesterId: string, workspaceId: string, documentId: string) {
        await ensureWorkspaceMember(requesterId, workspaceId);
        
        await ensureDocumentInWorkspace(workspaceId, documentId);

        return prisma.documentSnapshot.findMany({
            where: {
                documentId,
            },
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                createdAt: true,
                description: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    async getSnapshot( requesterId, workspaceId, documentId, snapshotId ) {
        await ensureWorkspaceMember(requesterId, workspaceId);

        await ensureDocumentInWorkspace(workspaceId, documentId);

        const snapshot = await prisma.documentSnapshot.findFirstOrThrow({
            where: {
                id: snapshotId,
                documentId,
            },
            select: {
                id: true,
                state: true,
                createdAt: true,
                description: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            }
        });

        return {
            ...snapshot,
            state: Array.from(snapshot.state),
        };
    }

}

export const snapshotService = new SnapshotService();