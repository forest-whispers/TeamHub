import * as Y from "yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";
import { Awareness } from "y-protocols/awareness";

import { persistenceService } from "./persistence.service.js";
import type { ActiveDocument } from "./yjs.types.js";

class YjsService {
    private documents = new Map<string, ActiveDocument>();
    private loadingPromises = new Map<string, Promise<ActiveDocument>>();

    getDocument(documentId: string) {
        return this.documents.get(documentId);
    }

    getDocumentState(documentId: string) {
        const document = this.documents.get(documentId);

        if (!document) {
            throw new Error("Document not loaded");
        }

        return Y.encodeStateAsUpdate(document.ydoc);
    }

    getActiveDocuments() {
        return [...this.documents.entries()].map(([documentId, document]) => ({
            documentId,
            users: document.users.size,
        }));
    }

    hasDocument(documentId: string) {
        return this.documents.has(documentId);
    }

    async getOrCreateDocument(documentId: string): Promise<ActiveDocument> {
        let document = this.documents.get(documentId);

        if (document) {
            return document;
        }

        let loadingPromise = this.loadingPromises.get(documentId);

        if (!loadingPromise) {
            loadingPromise = (async () => {
                try {
                    const json = await persistenceService.loadDocument(documentId);

                    const ydoc = TiptapTransformer.toYdoc(
                        json,
                        "default",
                        TiptapTransformer.defaultExtensions
                    );

                    const newDoc: ActiveDocument = {
                        ydoc,
                        users: new Set(),
                        awareness: new Awareness(ydoc),
                        awarenessClients: new Map(),
                    };

                    newDoc.awareness.states.delete(ydoc.clientID);

                    this.documents.set(documentId, newDoc);
                    return newDoc;
                } finally {
                    this.loadingPromises.delete(documentId);
                }
            })();

            this.loadingPromises.set(documentId, loadingPromise);
        }

        return loadingPromise;
    }

    async addUser(documentId: string, socketId: string) {
        const document = await this.getOrCreateDocument(documentId);

        document.users.add(socketId);

        return document;
    }

    async removeUser(documentId: string, socketId: string) {
        const document = this.documents.get(documentId);

        if (!document) return;

        document.users.delete(socketId);

        if (document.users.size > 0) {
            return;
        }

        const json = TiptapTransformer.fromYdoc( document.ydoc, "default" );

        try
        {
            await persistenceService.saveDocument(documentId, json);

            if (document.users.size === 0) {

                document.ydoc.destroy();

                this.documents.delete(documentId);
            }
        } catch (error) {
            console.error("Failed to save document on room close:", error);
        }
    }

    getUsers(documentId: string) {
        return this.documents.get(documentId)?.users ?? new Set();
    }

    destroyDocument(documentId: string) {
        const document = this.documents.get(documentId);

        if (!document) return;

        document.ydoc.destroy();
        this.documents.delete(documentId);
    }

    getDocumentCount() {
        return this.documents.size;
    }
}

export const yjsService = new YjsService();