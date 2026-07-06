import { useEffect, useRef } from "react";
import * as Y from "yjs";

export function useYDoc(documentId: string) {
    const ydocRef = useRef(new Y.Doc());
    const previousId = useRef(documentId);

    if (previousId.current !== documentId) {
        ydocRef.current.destroy();
        ydocRef.current = new Y.Doc();
        previousId.current = documentId;
    }

    useEffect(() => {
        return () => {
            ydocRef.current.destroy();
        };
    }, []);

    return {
        ydoc: ydocRef.current,
    };
}