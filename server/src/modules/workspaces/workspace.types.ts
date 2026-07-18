import type { WorkspaceActivity } from "../activity/activity.types.js";
import { getWorkspaceActivities } from "../activity/activity.service.js";

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

export interface WorkspaceHomeData {
    recentDocuments: [];

    // recentActivity: WorkspaceActivity[];
    recentActivity: Awaited< ReturnType<typeof getWorkspaceActivities> >["activities"];
}