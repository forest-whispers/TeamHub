import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { socket } from "@/shared/lib/socket";

interface Props {
    workspaceId: string;
    documentId: string;
    ydoc: Y.Doc;
    onInitialAwareness?: (update: Uint8Array) => void;
    publishLocalState: () => void;
}

function normalizeUpdate(raw: any): Uint8Array {
    if (raw instanceof Uint8Array) return raw;

    if (raw instanceof ArrayBuffer) {
        return new Uint8Array(raw);
    }

    if (Array.isArray(raw)) {
        return Uint8Array.from(raw);
    }

    if ( raw && raw.type === "Buffer" && Array.isArray(raw.data)) {
        return new Uint8Array(raw.data);
    }

    throw new Error("Unknown update format");
}

export function useCollaboration({ workspaceId, documentId, ydoc, onInitialAwareness, publishLocalState}: Props) {
    const hasInitialSyncRef = useRef(false);

    useEffect(() => {
        hasInitialSyncRef.current = false;
    }, [documentId]);

    const idsRef = useRef({
        workspaceId,
        documentId,
    });

    useEffect(() => {
        idsRef.current = {
            workspaceId,
            documentId,
        };
    }, [workspaceId, documentId]);

    useEffect(() => {
        function handleUpdate(rawUpdate: Uint8Array | ArrayBuffer | number[] | any) {

            const update = normalizeUpdate(rawUpdate)

            Y.applyUpdate(ydoc, update, "remote");
        }

        socket.on("document:update", handleUpdate);

        return () => {
            socket.off("document:update", handleUpdate);
        };
    }, [ydoc]);

    useEffect(() => {
        function handleLocalUpdate(update: Uint8Array, origin: unknown) {
            if (origin === "remote") return;
            if (origin === "initial") return;

            if (!hasInitialSyncRef.current) return;

            const {
                workspaceId: currentWorkspaceId,
                documentId: currentDocumentId,
            } = idsRef.current;

            socket.emit("document:update",
                {
                    workspaceId: currentWorkspaceId,
                    documentId: currentDocumentId,
                    update,
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

        ydoc.on("update", handleLocalUpdate);

        return () => {
            ydoc.off("update", handleLocalUpdate);
        };
    }, [ydoc]);

    useEffect(() => {
        hasInitialSyncRef.current = false;
        function applyInitialState(rawUpdate: Uint8Array | ArrayBuffer | number[] | any) {

            const update = normalizeUpdate(rawUpdate)

            if (hasInitialSyncRef.current) return;

            hasInitialSyncRef.current = true;

            Y.applyUpdate(ydoc, update, "initial");
        }

        socket.emit("document:join",
            {
                workspaceId,
                documentId,
            },
            (response: {
                success: boolean;
                message?: string;
                data?: {
                    initialState?: any;
                    awarenessState?: any;
                };
            }) => {
                if (!response.success) {
                    console.error(response.message);
                    return;
                }

                if (response.data?.initialState) {
                    applyInitialState(response.data.initialState);

                    if (response.data.awarenessState && onInitialAwareness) {
                        onInitialAwareness(normalizeUpdate(response.data.awarenessState));
                        publishLocalState();
                    }

                    // const localUpdate = Y.encodeStateAsUpdate(ydoc);
                    // socket.emit("document:update",
                    //     {
                    //         workspaceId,
                    //         documentId,
                    //         update: localUpdate
                    //     },
                    //     (response: {
                    //         success: boolean;
                    //         message?: string;
                    //     }) => {
                    //         if (!response.success) {
                    //             console.error(response.message);
                    //         }
                    //     }
                    // );
                }
                hasInitialSyncRef.current = true;
            }
        );

        return () => {
            hasInitialSyncRef.current = false;

            socket.emit("document:leave",
                {
                    documentId,
                },
                () => { }
            );
        };
    }, [workspaceId, documentId, ydoc]);
}