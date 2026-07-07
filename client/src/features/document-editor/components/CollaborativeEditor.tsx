import { useYDoc } from "../hooks/useYDoc";
import { useAuthStatus } from "@/features/auth/hooks/useAuthStatus";
import { useCollaboration } from "../hooks/useCollaboration";
import { useAwareness } from "../hooks/useAwareness";
import { TiptapEditor } from "./TiptapEditor";
import type { WorkspaceDocument } from "../types";
import type { AuthUser } from "@/features/auth/types";

interface CollaborativeEditorProps {
    documentData: WorkspaceDocument;
    workspaceId: string;
}

export function CollaborativeEditor({
    documentData,
    workspaceId,
}: CollaborativeEditorProps) {
    const { ydoc } = useYDoc(documentData.id);

    const { data: authStatus } = useAuthStatus()

    const { awareness, applyInitialAwareness, publishLocalState } = useAwareness({
        workspaceId,
        documentId: documentData.id,
        ydoc,
        authUser: authStatus?.user as AuthUser
    });

    useCollaboration({
        workspaceId,
        documentId: documentData.id,
        ydoc,
        onInitialAwareness: applyInitialAwareness,
        publishLocalState
    });

    return (
        <TiptapEditor
            key={documentData.id + ydoc.clientID}
            documentData={documentData}
            workspaceId={workspaceId}
            ydoc={ydoc}
            awareness={awareness}
        />
    );
}