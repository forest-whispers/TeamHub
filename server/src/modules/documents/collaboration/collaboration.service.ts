import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js"
import { applyAwarenessUpdate, encodeAwarenessUpdate, registerAwarenessClient, unregisterAwarenessClient } from "./awareness.service.js";
import { yjsService } from "./yjs.service.js";
import * as Y from "yjs";

export async function joinDocument(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string
) {
    await ensureWorkspaceMember(socket.data.user.id, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const document = await yjsService.addUser(documentId, socket.id);

    const state = Y.encodeStateAsUpdate(document.ydoc);

    const awarenessState = encodeAwarenessUpdate(documentId);

    socket.join(`document:${documentId}`);

    return {
        documentId,
        users: document.users.size,
        initialState: state,
        awarenessState,
    };
}

export async function updateDocument(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string,
    update: Uint8Array
) {
    const document = await yjsService.getOrCreateDocument(documentId);

    Y.applyUpdate(
        document.ydoc,
        update,
        socket.id
    );

    console.log("document:update >> broadcasted");

    socket.to(`document:${documentId}`).emit("document:update", update );
}

export async function updateAwareness(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string,
    clientId: number,
    update: Uint8Array
) {
    applyAwarenessUpdate(
        documentId,
        update,
        socket.id
    );

    registerAwarenessClient(
        documentId,
        socket.id,
        clientId
    );

    console.log("awareness update >> broadcasted");

    socket.to(`document:${documentId}`).emit("awareness:update", update );
}

export async function leaveDocument(
    socket: AuthenticatedSocket,
    documentId: string
) {

    const update = unregisterAwarenessClient(documentId, socket.id);
    if (update) {
        socket.to(`document:${documentId}`).emit("awareness:update", update);
    }

    socket.leave(`document:${documentId}`);

    await yjsService.removeUser(documentId, socket.id);

    return {
        documentId,
    };
}