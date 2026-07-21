import { useEffect, useMemo, useCallback } from "react";
import * as awarenessProtocol from "y-protocols/awareness";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

import { socket } from "@/shared/lib/socket";
import type { AuthUser } from "@/features/auth/types";
import { getUserColor } from "@/shared/lib/utils";

interface Props {
    workspaceId: string;
    documentId: string;
    ydoc: Y.Doc;
    authUser?: AuthUser;
}

function normalizeUpdate(raw: any): Uint8Array {
    if (raw instanceof Uint8Array) return raw;

    if (raw instanceof ArrayBuffer) {
        return new Uint8Array(raw);
    }

    if (Array.isArray(raw)) {
        return Uint8Array.from(raw);
    }

    if ( raw && raw.type === "Buffer" && Array.isArray(raw.data) ) {
        return new Uint8Array(raw.data);
    }

    throw new Error("Unknown update format");
}

export function useAwareness({ workspaceId, documentId, ydoc, authUser }: Props) {

    const awareness = useMemo(() => {
        const awareness = new Awareness(ydoc);
        return awareness;
    }, [ydoc]);

    useEffect(() => {
        const handleAwarenessChange = () => {
            console.log("Awareness state: updated",
                Array.from(awareness.getStates().entries()));
        };

        awareness.on("change", handleAwarenessChange);

        console.log("Awareness state: initial",
            Array.from(awareness.getStates().entries()));

        return () => {
            awareness.off("change", handleAwarenessChange);
        };
    }, [awareness]);

    useEffect(() => {
        function handleUpdate({ added, updated, removed, }: { added: number[]; updated: number[]; removed: number[]; }, origin: unknown) {
            if (origin === "remote" || origin === "initial") {
                return;
            }

            const changed = [
                ...added,
                ...updated,
                ...removed,
            ];

            const update =
                awarenessProtocol.encodeAwarenessUpdate(
                    awareness,
                    changed
                );

            socket.emit("awareness:update",
                {
                    workspaceId,
                    documentId,
                    clientId: awareness.clientID,
                    update,
                },
                (response: {
                    success: boolean;
                    message?: string;
                }) => {
                    if (!response.success) {
                        console.error(response.message);
                    }
                });
        }

        awareness.on("update", handleUpdate);

        return () => {
            awareness.off("update", handleUpdate);
        };
    }, [awareness, workspaceId, documentId]);

    const publishLocalState = useCallback(() => {
        if (!authUser) return;

        awareness.setLocalState({
            user: {
                id: authUser.id,
                name: authUser.name,
                avatar: authUser.avatar,
                color: getUserColor(authUser.id),
            },
            typing: false,
        });
    }, [awareness, authUser]);

    useEffect(() => {
        publishLocalState();
    }, [publishLocalState]);

    const applyInitialAwareness = useCallback((rawUpdate: any) => {
        const update = normalizeUpdate(rawUpdate);

        awarenessProtocol.applyAwarenessUpdate(
            awareness,
            update,
            "initial"
        );
    }, [awareness]);

    useEffect(() => {
        function handleAwarenessUpdate(rawUpdate: any) {
            const update = normalizeUpdate(rawUpdate);

            awarenessProtocol.applyAwarenessUpdate(
                awareness,
                update,
                "remote"
            );
        }

        socket.on("awareness:update",
            handleAwarenessUpdate);

        return () => {
            socket.off("awareness:update",
                handleAwarenessUpdate);
        };
    }, [awareness]);

    useEffect(() => {
        return () => {
            awareness.destroy();
        };
    }, [awareness]);

    return {
        awareness,
        applyInitialAwareness,
        publishLocalState
    };
}