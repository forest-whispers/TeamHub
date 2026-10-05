export interface ContinueWorkingDto {
    id: string;
    title: string;
    workspaceId: string;
    workspaceName: string;
    updatedAt: string;
}

export interface ActivityDto {
    id: string;
    type: string;
    entityType: string;
    entityId: string | null;
    metadata: any;
    workspaceId: string;
    createdAt: string;
    actor: {
        id: string;
        name: string;
        avatar: string | null;
    } | null;
}

export interface WorkspaceCardDto {
    id: string;
    name: string;
    description: string | null;
    memberCount: number;
    documentCount: number;
    fileCount: number;
    lastActivityAt: string | null;
    adminEmail: string;
}

export interface DashboardOverviewDto {
    totalWorkspaces: number;
    totalDocuments: number;
    totalFiles: number;
    totalMembers: number;
}

export interface DashboardResponseDto {
    overview: DashboardOverviewDto;
    continueWorking: ContinueWorkingDto | null;
    recentActivity: ActivityDto[];
    workspaces: WorkspaceCardDto[];
}