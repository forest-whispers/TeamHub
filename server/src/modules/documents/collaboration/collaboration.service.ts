import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js"
import { yjsService } from "./yjs.service.js";
import * as Y from "yjs";

export async function joinDocument(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string
) {
    await ensureWorkspaceMember(socket.data.user.id, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);


    const document = await yjsService.addUser(documentId, socket.data.user.id);

    const state = Y.encodeStateAsUpdate(document.ydoc);

    socket.join(`document:${documentId}`);

    return {
        documentId,
        users: document.users.size,
        initialState: state,
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

    Y.applyUpdate(
        document.ydoc,
        update,
        socket.id
    );

    socket.to(`document:${documentId}`).emit(
        "document:update",
        update
    );

    console.log("broadcasted");
}

export async function leaveDocument(
    socket: AuthenticatedSocket,
    documentId: string
) {
    socket.leave(`document:${documentId}`);

    await yjsService.removeUser(documentId, socket.data.user.id);

    return {
        documentId,
    };
}