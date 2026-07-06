import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js"
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

    const document = await yjsService.addUser(documentId, socket.data.user.id);

    console.log("join document",
        (TiptapTransformer.fromYdoc(
            document.ydoc,
            "default"
        )).content[0]
    );

    const state = Y.encodeStateAsUpdate(document.ydoc);

    console.log("join document", state);

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