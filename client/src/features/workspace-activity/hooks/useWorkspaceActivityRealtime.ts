import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socket } from "@/shared/lib/socket";

import type { ActivityNewPayload, WorkspaceActivity, } from "../types/index";

export function useWorkspaceActivityRealtime(
    workspaceId: string
) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!workspaceId) return;

        function handleNewActivity(
            payload: ActivityNewPayload
        ) {
            const activity = payload.activity;

            if (activity.workspaceId !== workspaceId) {
                return;
            }

            // queryClient.setQueriesData<WorkspaceActivity[]>(
            //     {
            //         queryKey: [
            //             "workspace-activities",
            //             workspaceId,
            //         ],
            //     },
            //     (current) => {
            //         if (!current) {
            //             return current;
            //         }

            //         if (
            //             current.some(
            //                 (item) => item.id === activity.id
            //             )
            //         ) {
            //             return current;
            //         }

            //         return [
            //             activity,
            //             ...current,
            //         ];
            //     }
            // );

            queryClient.setQueryData<WorkspaceActivity[]>(
                [
                    "workspace-activities",
                    workspaceId,
                    5,
                ],
                (current) => {
                    if (!current) {
                        return current;
                    }

                    if (
                        current.some(
                            (item) => item.id === activity.id
                        )
                    ) {
                        return current;
                    }

                    return [
                        activity,
                        ...current,
                    ].slice(0, 5);
                }
            );
        }

        socket.on(
            "activity:new",
            handleNewActivity
        );

        return () => {
            socket.off(
                "activity:new",
                handleNewActivity
            );
        };
    }, [
        workspaceId,
        queryClient,
    ]);
}