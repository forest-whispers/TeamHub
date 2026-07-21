import { useEffect, useRef } from "react";
import * as Y from "yjs";

export function useYDoc(documentId: string) {
    const ydocRef = useRef<Y.Doc | null>(null);
    const previousId = useRef(documentId);

    if (!ydocRef.current) {
        ydocRef.current = new Y.Doc();
    }

    if (previousId.current !== documentId) {
        if (ydocRef.current) {
            ydocRef.current.destroy();
        }
        ydocRef.current = new Y.Doc();
        previousId.current = documentId;
    }

    useEffect(() => {
        return () => {
            if (ydocRef.current && previousId.current !== documentId) {
                ydocRef.current.destroy();
                ydocRef.current = null;
            }
        };
    }, [documentId]);

    return {
        ydoc: ydocRef.current,
    };
}