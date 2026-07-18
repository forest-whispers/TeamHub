import {
    FileText,
    MessageSquare,
    Settings,
    UserPlus,
    Users,
    Activity,
    Globe,
} from "lucide-react";

import type { FormattedActivity } from "../types/ui";

export function getActivityIcon(
    category: FormattedActivity["category"]
) {
    switch (category) {

        case "document":
            return <FileText className="size-4 text-sky-500" />;

        case "comment":
            return <MessageSquare className="size-4 text-emerald-500" />;

        case "member":
            // return <UserPlus className="size-4 text-violet-500" />;
            return <Users className="size-4 text-violet-500" />;

        case "workspace":
            return <Settings className="size-4 text-amber-500" />;

        default:
            // return <Activity className="size-4 text-muted-foreground" />;
            return <Globe className="size-4 text-muted-foreground" />
    }
}