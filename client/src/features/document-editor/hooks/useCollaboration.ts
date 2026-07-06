import { useEffect, useRef } from "react";
import * as Y from "yjs";
import { socket } from "@/shared/lib/socket";

interface Props {
    workspaceId: string;
    documentId: string;
    ydoc: Y.Doc;
}

export function useCollaboration({ workspaceId, documentId, ydoc,}: Props) {
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
        socket.emit("document:join",
            {
                workspaceId,
                documentId,
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

        return () => {
            socket.emit("document:leave",
                {
                    documentId,
                },
                () => { }
            );
        };
    }, [workspaceId, documentId]);

    useEffect(() => {
        function handleUpdate(rawUpdate: Uint8Array | ArrayBuffer | number[]) {
            console.log("LOCAL UPDATE");
            let update: Uint8Array;

            if (rawUpdate instanceof Uint8Array) {
                update = rawUpdate;
            } else if (rawUpdate instanceof ArrayBuffer) {
                update = new Uint8Array(rawUpdate);
            } else {
                update = Uint8Array.from(rawUpdate);
            }

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

            const {
                workspaceId: currentWorkspaceId,
                documentId: currentDocumentId,
            } = idsRef.current;

            socket.emit(
                "document:update",
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
}