import { useEffect, useRef, useState } from "react";

import { socket } from "@/shared/lib/socket";
import type { AuthUser } from "@/features/auth/types";
import { getUserColor } from "@/shared/lib/utils";

interface PresenceUser {
    id: string;
    name: string;
    avatar: string | null;
    color: string;
}

export interface PresenceState {
    user: PresenceUser;
    status: "online" | "away" | "offline";
    activity: {
        type: string;
    };
}

interface Props {
    workspaceId: string;
    authUser?: AuthUser;
}

export function useWorkspacePresence({ workspaceId, authUser, }: Props) {

    const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);

    const workspaceIdRef = useRef(workspaceId);

    useEffect(() => {
        workspaceIdRef.current = workspaceId;
    }, [workspaceId]);

    useEffect(() => {
        if (!workspaceId || !authUser) return;

        socket.emit("workspace:join",
            {
                workspaceId,
                presence: {
                    user: {
                        id: authUser.id,
                        name: authUser.name,
                        avatar: authUser.avatar,
                        color: getUserColor(authUser.id),
                    },
                    status: "online",
                    activity: {
                        type: "documents",
                    },
                },
            },
            (response: {
                success: boolean;
                message?: string;
                data: {
                    users?: PresenceState[];
                }
            }) => {
                if (!response.success) {
                    console.error(response.message);
                    return;
                }

                if (response.data.users) {
                    setOnlineUsers(response.data.users);
                }
            }
        );

        return () => {
            socket.emit("workspace:leave",
                {
                    workspaceId,
                },
                () => { }
            );
        };
    }, [workspaceId, authUser]);

    useEffect(() => {

        function handlePresenceUpdate( users: PresenceState[] ) {
            setOnlineUsers(users);
        }

        socket.on("workspace:presence", handlePresenceUpdate);

        return () => {
            socket.off("workspace:presence", handlePresenceUpdate);
        };

    }, []);

    function updatePresence( presence: PresenceState ) {

        socket.emit("workspace:update",
            {
                workspaceId: workspaceIdRef.current,
                presence,
            },
            (response: {
                success: boolean;
                message?: string;
            }) => {
                if (!response.success) {
                    console.error(response.message);
                }
            }
        );

    }

    return {
        onlineUsers,
        updatePresence,
    };
}