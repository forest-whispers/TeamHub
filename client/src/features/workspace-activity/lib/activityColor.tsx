import type { FormattedActivity } from "../types/ui";

export function getActivityColor(
    category: FormattedActivity["category"]
) {

    switch (category) {

        case "document":
            return "bg-sky-500/10 border-sky-500/20";

        case "comment":
            return "bg-emerald-500/10 border-emerald-500/20";

        case "member":
            return "bg-violet-500/10 border-violet-500/20";

        case "workspace":
            return "bg-amber-500/10 border-amber-500/20";

        default:
            return "bg-muted/10 border-border";
    }
}