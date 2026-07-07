import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js"
import { applyAwarenessUpdate, encodeAwarenessUpdate, registerAwarenessClient, unregisterAwarenessClient } from "./awareness.service.js";
import { yjsService } from "./yjs.service.js";
import * as Y from "yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";

export async function joinDocument(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string
) {
    await ensureWorkspaceMember(socket.data.user.id, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const document = await yjsService.addUser(documentId, socket.id);

    console.log("join document",
        (TiptapTransformer.fromYdoc(
            document.ydoc,
            "default"
        )).content[0]
    );

    const state = Y.encodeStateAsUpdate(document.ydoc);

    const awarenessState = encodeAwarenessUpdate(documentId);

    console.log("join document", state);

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
    await ensureWorkspaceMember( socket.data.user.id, workspaceId,);

    await ensureDocumentInWorkspace( workspaceId, documentId,);

    const document = await yjsService.getOrCreateDocument(documentId);

    console.log("update document",
        (TiptapTransformer.fromYdoc(
            document.ydoc,
            "default"
        )).content[0]
    );

    Y.applyUpdate(
        document.ydoc,
        update,
        socket.id
    );

    console.log("updated document",
        (TiptapTransformer.fromYdoc(
            document.ydoc,
            "default"
        )).content[0]
    );

    socket.to(`document:${documentId}`).emit("document:update", update );

    console.log("update document >> broadcasted");
}

export async function updateAwareness(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string,
    clientId: number,
    update: Uint8Array
) {
    await ensureWorkspaceMember( socket.data.user.id, workspaceId );

    await ensureDocumentInWorkspace( workspaceId, documentId );

    applyAwarenessUpdate(
        documentId,
        update,
        socket.id
    );

    const document = yjsService.getDocument(documentId)

    registerAwarenessClient(
        documentId,
        socket.id,
        clientId
    );
    
    for (const [id, state] of document!.awareness.getStates()) {
        console.log("clientId:", id);
        console.log("state:", state);
    }

    console.log("total users active at document:", document?.users.size)

    socket.to(`document:${documentId}`).emit("awareness:update", update );

    console.log("awareness update >> broadcasted");
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