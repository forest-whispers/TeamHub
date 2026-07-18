import type { WorkspaceActivity } from "../../features/workspace-activity/types/index";

import type { FormattedActivity } from "../../features/workspace-activity/types/ui";

export function formatActivity(
    activity: WorkspaceActivity
): FormattedActivity {

    const metadata = activity.metadata ?? {};

    switch (activity.type) {

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
                action: "renamed document to",
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
    }
}