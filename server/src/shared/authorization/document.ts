import { prisma } from "../../lib/prisma.js";

export const ensureDocumentInWorkspace = (workspaceId: string, documentId: string) =>
    prisma.document.findFirstOrThrow({
        where: {
            id: documentId,
            workspaceId,
        },
    });