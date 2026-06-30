import { prisma } from "../../lib/prisma.js";
import { ensureWorkspaceMember } from "../../shared/authorization/workspace.js";
import { ensureDocumentInWorkspace } from "../../shared/authorization/document.js";
import { EMPTY_DOCUMENT } from "../../config/constants.js";
import type { CreateDocumentDto, UpdateDocumentDto } from "./document.types.js";

export const createDocument = async (requesterId: string, workspaceId: string, data: CreateDocumentDto) => {
    await ensureWorkspaceMember(requesterId, workspaceId);

    const document = await prisma.document.create({
        data: {
            title: data.title,
            content: EMPTY_DOCUMENT,
            workspaceId,
            createdById: requesterId,
        },
        select: {
            id: true,
        },
    });

    return document;
};

export const getDocuments = async (requesterId: string, workspaceId: string) => {
    await ensureWorkspaceMember(requesterId, workspaceId);

    const documents = await prisma.document.findMany({
        where: { workspaceId },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            icon: true,
            updatedAt: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return documents;
};

export const getDocument = async (requesterId: string, workspaceId: string, documentId: string) => {
    await ensureWorkspaceMember(requesterId, workspaceId);

    const document = await ensureDocumentInWorkspace(workspaceId, documentId);

    return prisma.document.findUniqueOrThrow({
        where: { id: document.id },
        select: {
            id: true,
            title: true,
            icon: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

export const updateDocument = async ( requesterId: string, workspaceId: string, documentId: string, data: UpdateDocumentDto) => {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    return prisma.document.update({
        where: { id: documentId },
        data,
        select: {
            id: true,
            title: true,
            icon: true,
            content: true,
            workspaceId: true,
            createdById: true,
            createdAt: true,
            updatedAt: true,
        },
    });
};

export const deleteDocument = async (requesterId: string, workspaceId: string, documentId: string) => {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    await prisma.document.delete({
        where: { id: documentId },
    });
};