import { prisma } from "../../config/prisma.js";

export const ensureDocumentInWorkspace = (workspaceId: string, documentId: string) =>
    prisma.document.findFirstOrThrow({
        where: {
            id: documentId,
            workspaceId,
        },
});