import type { ActiveWorkspace, PresenceState } from "./presence.types.js";

class PresenceService {
    private workspaces = new Map<string, ActiveWorkspace>();

    private getOrCreateWorkspace(workspaceId: string) {
        let workspace = this.workspaces.get(workspaceId);

        if (!workspace) {
            workspace = {
                users: new Map(),
            };

            this.workspaces.set(
                workspaceId,
                workspace
            );
        }

        return workspace;
    }

    joinWorkspace( workspaceId: string, socketId: string, presence: PresenceState ) {
        const workspace = this.getOrCreateWorkspace(
                workspaceId
            );

        workspace.users.set(
            socketId,
            {
                socketId,
                presence
            }
        );

        console.log("workspace map:", Array.from(workspace.users.keys()));

        return workspace;
    }

    updatePresence( workspaceId: string, socketId: string, presence: PresenceState ) {
        const workspace = this.workspaces.get(workspaceId);

        if (!workspace) return null;

        const activeUser = workspace.users.get(socketId);

        if (!activeUser) return null;

        activeUser.presence = presence;

        return workspace;
    }

    getPresenceList(workspaceId: string) {
        const workspace = this.workspaces.get(workspaceId);

        if (!workspace) return [];

        return Array.from(workspace.users.values()).map(
            ({ presence }) => presence
        );
    }

    removeConnection( workspaceId: string, socketId: string ) {
        const workspace = this.workspaces.get(workspaceId);

        if (!workspace) return;

        workspace.users.delete(socketId);

        console.log("workspace map:", Array.from(workspace.users.keys()));

        if (workspace.users.size === 0) {
            this.workspaces.delete( workspaceId );
        }

        return workspace;
    }

    getPresence( workspaceId: string ) {
        return this.workspaces.get(
            workspaceId
        );
    }
}

export const presenceService = new PresenceService();