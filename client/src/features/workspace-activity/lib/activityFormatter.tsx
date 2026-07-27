import type { WorkspaceActivity } from "../types/index";

import type { FormattedActivity } from "../types/ui";

export function formatActivity(
    activity: WorkspaceActivity
): FormattedActivity {

    const metadata = activity.metadata ?? {};

    switch (activity.type) {

        case "WORKSPACE_MEMBER_JOINED":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "joined workspace",
                target: "",
                timestamp: activity.createdAt,
                category: "workspace",
            };

        case "WORKSPACE_MEMBER_LEFT":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "left workspace",
                target: "",
                timestamp: activity.createdAt,
                category: "workspace",
                
            };

        case "MEMBER_ROLE":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: `changed ${metadata.memberName}'s role from ${metadata.oldRole} to`,
                target: typeof metadata.newRole === "string" ? metadata.newRole : "MEMBER",
                timestamp: activity.createdAt,
                category: "workspace",
            };

        case "DOCUMENT_CREATED":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "created document",
                target:
                    typeof metadata.title === "string"
                        ? metadata.title
                        : "Document",
                timestamp: activity.createdAt,
                category: "document",
            };

        case "DOCUMENT_RENAMED":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "renamed a document to",
                target:
                    typeof metadata.newTitle === "string"
                        ? metadata.newTitle
                        : "Document",
                timestamp: activity.createdAt,
                category: "document",
            };

        case "DOCUMENT_DELETED":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "deleted document",
                target:
                    typeof metadata.title === "string"
                        ? metadata.title
                        : "Document",
                timestamp: activity.createdAt,
                category: "document",
            };

        case "FILE_CREATED":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "uploaded file",
                target:
                    typeof metadata.displayName === "string"
                        ? metadata.displayName
                        : "File",
                timestamp: activity.createdAt,
                category: "workspace",
            };

        case "FILE_RENAMED":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "renamed file to",
                target:
                    typeof metadata.newDisplayName === "string"
                        ? metadata.newDisplayName
                        : "File",
                timestamp: activity.createdAt,
                category: "workspace",
            };

        case "FILE_DELETED":
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "deleted file",
                target:
                    typeof metadata.displayName === "string"
                        ? metadata.displayName
                        : "File",
                timestamp: activity.createdAt,
                category: "workspace",
            };

        default:
            return {
                id: activity.id,
                actor: activity.actor?.name ?? "Unknown",
                action: "performed an action",
                target: "Workspace",
                timestamp: activity.createdAt,
                category: "workspace",
            };
    }
}