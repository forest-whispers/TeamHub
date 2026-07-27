export type ActivityType =
  | "WORKSPACE_MEMBER_JOINED"
  | "WORKSPACE_MEMBER_LEFT"
  | "MEMBER_ROLE"
  | "DOCUMENT_CREATED"
  | "DOCUMENT_RENAMED"
  | "DOCUMENT_DELETED"
  | "FILE_CREATED"
  | "FILE_RENAMED"
  | "FILE_DELETED";

export type ActivityEntityType =
  | "USER"
  | "MEMBER"
  | "DOCUMENT"
  | "FILE";

export interface ActivityActor {
  id: string;
  name: string;
  avatar: string | null;
}

export interface WorkspaceActivity {
  id: string;

  type: ActivityType;

  entityType: ActivityEntityType;

  entityId: string | null;

  metadata: Record<string, unknown> | null;

  workspaceId: string;

  createdAt: string;

  actor: ActivityActor | null;
}

export interface ActivityNewPayload {
  activity: WorkspaceActivity;
}

export interface WorkspaceActivityService {
  getWorkspaceActivity(workspaceId: string): Promise<WorkspaceActivity[]>
}