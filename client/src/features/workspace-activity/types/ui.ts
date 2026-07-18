export interface FormattedActivity {
    id: string;

    actor: string;

    action: string;

    target: string;

    timestamp: string;

    category:
    | "document"
    | "member"
    | "workspace"
    | "comment";
}