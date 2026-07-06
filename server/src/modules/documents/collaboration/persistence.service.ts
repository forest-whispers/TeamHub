import { prisma } from "../../../lib/prisma.js";

class PersistenceService {
    async loadDocument(documentId: string) {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            select: {
                content: true,
            },
        });

        return document?.content ?? {
            type: "doc",
            content: [],
        };
    }

    async saveDocument(documentId: string, content: any) {
        await prisma.document.update({
            where: { id: documentId },
            data: {
                content,
            },
        });
    }
}

export const persistenceService = new PersistenceService();