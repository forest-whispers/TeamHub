export interface PresenceState {
    user: {
        id: string;
        name: string;
        avatar: string | null;
        color: string;
    };

    status: "online";

    activity: {
        type: string;

        documentId?: string;

        title?: string;
    };
}

export interface ActiveWorkspaceUser {
    socketId: string;
    presence: PresenceState;
}

export interface ActiveWorkspace {
    users: Map<string, ActiveWorkspaceUser>;
}

export interface JoinWorkspacePayload {
    workspaceId: string;

    presence: PresenceState;
}

export interface UpdatePresencePayload {
    workspaceId: string;

    presence: PresenceState;
}

export interface WorkspacePresencePayload {
    users: PresenceState[];
}

export interface LeaveWorkspacePayload {
    workspaceId: string;
}