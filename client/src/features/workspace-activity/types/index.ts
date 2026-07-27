export type ActivityType =
  | "DOCUMENT_CREATED"
  | "DOCUMENT_RENAMED"
  | "DOCUMENT_DELETED"
  | "FILE_CREATED"
  | "FILE_RENAMED"
  | "FILE_DELETED";

export type ActivityEntityType =
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