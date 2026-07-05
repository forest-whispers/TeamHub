import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import { ensureDocumentInWorkspace } from "../../../shared/authorization/document.js";
import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js"
import { yjsService } from "./yjs.service.js";

export async function joinDocument(
    socket: AuthenticatedSocket,
    workspaceId: string,
    documentId: string
) {
    await ensureWorkspaceMember(socket.data.user.id, workspaceId);

    await ensureDocumentInWorkspace(workspaceId, documentId);

    const document = await yjsService.addUser(documentId, socket.data.user.id);

    socket.join(`document:${documentId}`);

    return {
        documentId,
        users: document.users.size,
    };
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