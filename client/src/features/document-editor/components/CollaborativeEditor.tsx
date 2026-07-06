import { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import { useYDoc } from "../hooks/useYDoc";
import { useCollaboration } from "../hooks/useCollaboration";
import { TiptapEditor } from "./TiptapEditor";
import type { WorkspaceDocument } from "../types";

interface CollaborativeEditorProps {
    documentData: WorkspaceDocument;
    workspaceId: string;
}

export function CollaborativeEditor({
    documentData,
    workspaceId,
}: CollaborativeEditorProps) {
    const { ydoc, hydrate } = useYDoc(documentData.id);

    const [activeYdoc, setActiveYdoc] = useState<Y.Doc | null>(null);
    const lastProcessedId = useRef<string | null>(null);

    useCollaboration({
        workspaceId,
        documentId: documentData.id,
        ydoc,
    });

    useEffect(() => {
        if (documentData.content && lastProcessedId.current !== documentData.id) {

            hydrate(documentData.content);

            lastProcessedId.current = documentData.id;

            setActiveYdoc(ydoc);
        }
    }, [documentData.id, documentData.content, hydrate, ydoc]);

    if (!activeYdoc) {
        return <div className="p-4 text-sm text-muted-foreground">Loading text layout...</div>;
    }

    return (
        <TiptapEditor
            key={documentData.id}
            documentData={documentData}
            workspaceId={workspaceId}
            ydoc={activeYdoc}
        />
    );
}