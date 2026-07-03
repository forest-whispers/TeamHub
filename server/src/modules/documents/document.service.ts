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
            // icon: data.icon ?? null,
            content: EMPTY_DOCUMENT,
            workspaceId,
            createdById: requesterId,
            ...(data.icon !== undefined && { icon: data.icon }),
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
            workspaceId: true,
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

    const doc = await prisma.document.findUniqueOrThrow({
        where: { id: document.id },
        select: {
            id: true,
            title: true,
            icon: true,
            content: true,
            createdAt: true,
            updatedAt: true,
            workspaceId: true,
            createdBy: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return doc

    // const documentJson = doc.content as any;
    // const innerContent = documentJson?.content || [];

    // return {
    //     ...doc, content: innerContent
    // }
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
            createdBy: {
                select: {
                    id: true,
                    name: true
                }
            },
            createdAt: true,
            updatedAt: true,
        },
    });
};

export async function updateDocumentContent( requesterId: string, workspaceId: string, documentId: string, content: any) {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    console.log(content)

    return prisma.document.update({
        where: {
            id: documentId,
        },
        data: {
            content,
        },
        select: {
            id: true,
            updatedAt: true,
        },
    });
  }

export const deleteDocument = async (requesterId: string, workspaceId: string, documentId: string) => {
    await ensureWorkspaceMember(requesterId, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    await prisma.document.delete({
        where: { id: documentId },
    });
};