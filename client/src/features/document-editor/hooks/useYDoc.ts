import { useRef, useEffect, useCallback } from "react";
import * as Y from "yjs";
import { TiptapTransformer } from "@hocuspocus/transformer";

export function useYDoc(documentId: string) {
    const ydocRef = useRef<Y.Doc | null>(null);
    const hydratedRef = useRef<string | null>(null);

    if (!ydocRef.current) {
        ydocRef.current = new Y.Doc();
      }

    useEffect(() => {

        return () => {
            if (ydocRef.current) {
                ydocRef.current.destroy();
                ydocRef.current = null;
              }
        };
    }, [documentId]);

    const prevDocIdRef = useRef(documentId);

    useEffect(() => {

        if (prevDocIdRef.current === documentId) return;

        ydocRef.current?.destroy();

        ydocRef.current = new Y.Doc();

        hydratedRef.current = null;
        prevDocIdRef.current = documentId;
    }, [documentId]);

    const hydrate = useCallback((content: any) => {
        if (hydratedRef.current === documentId || !content || !ydocRef.current) return;

        const tempDoc = TiptapTransformer.toYdoc(
            content,
            "default",
            TiptapTransformer.defaultExtensions
        );

        const currentDoc = ydocRef.current;
        currentDoc.transact(() => {
            const update = Y.encodeStateAsUpdate(tempDoc);
            Y.applyUpdate(currentDoc, update);
        });

        tempDoc.destroy();
        
        hydratedRef.current = documentId;

        return true;
    }, [documentId]);

    return {
        ydoc: ydocRef.current,
        hydrate,
    };
}