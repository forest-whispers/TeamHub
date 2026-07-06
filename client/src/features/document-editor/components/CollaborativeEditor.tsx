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
    const { ydoc } = useYDoc(documentData.id);

    useCollaboration({
        workspaceId,
        documentId: documentData.id,
        ydoc,
    });

    return (
        <TiptapEditor
            key={documentData.id + ydoc.clientID}
            documentData={documentData}
            workspaceId={workspaceId}
            ydoc={ydoc}
        />
    );
}