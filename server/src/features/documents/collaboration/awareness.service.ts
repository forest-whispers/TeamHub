import * as awarenessProtocol from "y-protocols/awareness";

import { yjsService } from "./yjs.service.js";

export function registerAwarenessClient( documentId: string, socketId: string, clientId: number ) {
    const document = yjsService.getDocument(documentId);

    if (!document) return;

    document.awarenessClients.set(socketId, clientId);
}

export function applyAwarenessUpdate( documentId: string, update: Uint8Array, origin: unknown ) {
    const document = yjsService.getDocument(documentId);

    if (!document) return;

    awarenessProtocol.applyAwarenessUpdate(
        document.awareness,
        update,
        origin
    );
}

export function encodeAwarenessUpdate(documentId: string) {
    const document = yjsService.getDocument(documentId);

    if (!document) return null;

    return awarenessProtocol.encodeAwarenessUpdate(
        document.awareness,
        Array.from(document.awareness.getStates().keys())
    );
}

export function unregisterAwarenessClient( documentId: string, socketId: string ) {
    const document = yjsService.getDocument(documentId);

    if (!document) return;

    const clientId = document.awarenessClients.get(socketId);

    if (clientId === undefined) return;

    awarenessProtocol.removeAwarenessStates(
        document.awareness,
        [clientId],
        "disconnect"
    );

    document.awarenessClients.delete(socketId);

    return awarenessProtocol.encodeAwarenessUpdate(
        document.awareness,
        [clientId]);
}