import { getIO } from "../../infrastructure/websocket/socket.js";

interface ActivityPayload {
    id: string;
    type: string;
    entityType: string;
    entityId: string | null;
    metadata: unknown;
    workspaceId: string;
    createdAt: Date;
    actor: {
        id: string;
        name: string;
        avatar: string | null;
    } | null;
}

export function publishActivity(
    workspaceId: string,
    activity: unknown
) {
    const io = getIO();

    io.to(`workspace:${workspaceId}`).emit(
        "activity:new",
        {
            activity,
        }
    );
}