import { ensureWorkspaceMember } from "../../../shared/authorization/workspace.js";
import { presenceService, } from "./presence.service.js";
import type { AuthenticatedSocket } from "../../../infrastructure/websocket/types.js";
import type { PresenceState } from "./presence.types.js";

export async function joinWorkspace(
    socket: AuthenticatedSocket,
    workspaceId: string,
    presence: PresenceState
) {
    await ensureWorkspaceMember(
        socket.data.user.id,
        workspaceId
    );

    const workspace = presenceService.joinWorkspace(
            workspaceId,
            socket.id,
            presence
        );

    const users = presenceService.getPresenceList( workspaceId );

    console.log("workspace join >> presence", presence);

    console.log("total users active in workspace:", workspace?.users.size)

    socket.join(`workspace:${workspaceId}`);

    return users
}

export async function updateWorkspace(
    socket: AuthenticatedSocket,
    workspaceId: string,
    presence: PresenceState
) {
    await ensureWorkspaceMember(
        socket.data.user.id,
        workspaceId
    );

    const workspace = presenceService.updatePresence(
            workspaceId,
            socket.id,
            presence
        );

    if (!workspace) return;

    console.log("update presence", presence)

    const users = presenceService.getPresenceList( workspaceId );

    return users;
}

export async function leaveWorkspace(
    socket: AuthenticatedSocket,
    workspaceId: string
) {
    await ensureWorkspaceMember(
        socket.data.user.id,
        workspaceId
    );

    const workspace = presenceService.leaveWorkspace(
            workspaceId,
            socket.id
        );

    const users = presenceService.getPresenceList( workspaceId );

    return users;
}