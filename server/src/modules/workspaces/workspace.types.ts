export interface CreateWorkspaceDto {
    name: string;
    description?: string;
    color?: string | null;
}

export interface UpdateWorkspaceDto {
    name?: string;
    description?: string;
    color?: string | null;
}

export interface JoinWorkspaceDto {
    inviteCode: string;
}

export interface WorkspaceResponse {
    id: string;
    inviteCode: string;
}